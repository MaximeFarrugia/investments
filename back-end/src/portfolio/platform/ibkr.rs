use anyhow::Context;
use axum::http::StatusCode;
use ibkr_activity_statement_parser::ActivityStatement;
use mongodb::bson::{doc, oid::ObjectId};

use crate::{
    AppState, Model,
    error::AppResult,
    portfolio::models::{AccountStatement, Dividend, OpenPosition, Platform, PortfolioAccount},
};

pub async fn new_statement(
    state: &AppState,
    account_id: &ObjectId,
    file_content: String,
) -> AppResult<String> {
    let account_collection = PortfolioAccount::get_collection(&state)?;
    let collection = AccountStatement::get_collection(&state)?;
    let activity_statement = ActivityStatement::parse(file_content.as_str())
        .context("Failed to parse IBKR activity statement")?;

    let account = account_collection
        .find_one(doc! {
            "_id": account_id.clone(),
            "name": activity_statement.account_information.account.clone(),
        })
        .await
        .context("Failed to check if account exists")?;
    if account.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::NOT_FOUND)
                .with_title("Not found")
                .with_detail("No account with this id and name found in your portfolio.")
                .into(),
        );
    }

    let start = activity_statement
        .period
        .start
        .and_time(
            chrono::NaiveTime::from_hms_opt(0, 0, 0)
                .expect("chrono::NaiveTime::from_hms_opt(0, 0, 0) should work"),
        )
        .and_utc();
    let end = activity_statement
        .period
        .end
        .and_time(
            chrono::NaiveTime::from_hms_opt(0, 0, 0)
                .expect("chrono::NaiveTime::from_hms_opt(0, 0, 0) should work"),
        )
        .and_utc();
    let statement = collection
        .find_one(doc! {
            "account_id": account_id.clone(),
            "$and": [
                doc! {
                    "start": doc! {
                        "$lte": end,
                    },
                },
                doc! {
                    "end": doc! {
                        "$gte": start,
                    },
                },
            ],
        })
        .await
        .context("Failed to check statement overlaps")?;
    if let Some(statement) = statement {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::CONFLICT)
                .with_title("Statement overlap")
                .with_detail(format!(
                    "This statement overlaps an existing statement (start: {}, end: {})",
                    statement.start, statement.end
                ))
                .into(),
        );
    }

    let now = chrono::Utc::now();
    let statement = collection
        .insert_one(AccountStatement {
            id: None,
            account_id: account_id.to_owned(),
            start,
            end,
            created_at: now,
            updated_at: now,
        })
        .await
        .context("Failed to create statement")?;
    let statement_id = statement
        .inserted_id
        .as_object_id()
        .context("Failed to get new statement's id")?;

    if let Some(stocks) = activity_statement.open_positions.stocks {
        let collection = OpenPosition::get_collection(&state)?;
        collection
            .insert_many(
                stocks
                    .iter()
                    .filter(|x| {
                        x.symbol.is_some() && x.quantity.is_some() && x.cost_price.is_some()
                    })
                    .map(|x| OpenPosition {
                        id: None,
                        account_id: account_id.to_owned(),
                        statement_id: statement_id.clone(),
                        symbol: x.symbol.as_ref().unwrap().to_owned(),
                        quantity: x.quantity.unwrap(),
                        cost_price: x.cost_price.unwrap(),
                        currency: x.currency.to_owned(),
                    }),
            )
            .await
            .context("Failed to create open positions")?;
    }

    if activity_statement.dividends.0.len() > 0 {
        let collection = Dividend::get_collection(&state)?;
        collection
            .insert_many(activity_statement.dividends.0.iter().map(|x| {
                Dividend {
                    id: None,
                    account_id: account_id.to_owned(),
                    statement_id: statement_id.clone(),
                    symbol: x.symbol.to_owned(),
                    date: x
                        .date
                        .and_time(
                            chrono::NaiveTime::from_hms_opt(0, 0, 0)
                                .expect("chrono::NaiveTime::from_hms_opt(0, 0, 0) should work"),
                        )
                        .and_utc(),
                    amount: x.amount,
                    currency: x.currency.to_owned(),
                }
            }))
            .await
            .context("Failed to create dividends")?;
    }

    Ok(statement_id.to_string())
}

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

    new_statement(state, &account_id, file_content).await?;

    Ok(account_id.to_string())
}
