use anyhow::Context;
use axum::http::StatusCode;
use ibkr_activity_statement_parser::ActivityStatement;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    AppState, Model,
    error::AppResult,
    portfolio::models::{Dividend, OpenPosition, Platform, PortfolioAccount},
};

pub async fn new_account(
    state: &AppState,
    user_id: &ObjectId,
    file_content: String,
) -> AppResult<String> {
    let collection = PortfolioAccount::get_collection(&state)?;
    let activity_statement = ActivityStatement::parse(file_content.as_str())
        .context("Failed to parse IBKR activity statement")?;

    let account = collection
        .find_one(doc! {
            "user_id": user_id.clone(),
            "name": activity_statement.account_information.account.clone(),
        })
        .await
        .context("Failed to check if account already exists")?;
    if account.is_some() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::CONFLICT)
                .with_title("Account already exists")
                .with_detail("An account with this name already exists in your portfolio.")
                .into(),
        );
    }

    let now = chrono::Utc::now();
    let account = collection
        .insert_one(PortfolioAccount {
            id: None,
            user_id: user_id.to_owned(),
            name: activity_statement.account_information.account,
            platform: Platform::IBKR,
            base_currency: activity_statement.account_information.base_currency,
            created_at: now,
            updated_at: now,
        })
        .await
        .context("Failed to create account")?;
    let account_id = account
        .inserted_id
        .as_object_id()
        .context("Failed to get new account's id")?;

    if let Some(stocks) = activity_statement.open_positions.stocks {
        let collection = OpenPosition::get_collection(&state)?;
        collection
            .insert_many(stocks.iter().map(|x| OpenPosition {
                id: None,
                account_id: account_id.clone(),
                symbol: x.symbol.to_owned(),
                quantity: x.quantity,
                cost_price: x.cost_price,
                currency: x.currency.to_owned(),
            }))
            .await
            .context("Failed to create open positions")?;
    }

    if activity_statement.dividends.0.len() > 0 {
        let collection = Dividend::get_collection(&state)?;
        collection
            .insert_many(activity_statement.dividends.0.iter().map(|x| Dividend {
                id: None,
                account_id: account_id.clone(),
                symbol: x.symbol.to_owned(),
                date: x.date,
                amount: x.amount,
                currency: x.currency.to_owned(),
            }))
            .await
            .context("Failed to create dividends")?;
    }

    Ok(account_id.to_string())
}
