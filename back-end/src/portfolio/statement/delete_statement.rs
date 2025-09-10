use anyhow::Context;
use axum::{
    Extension,
    extract::{Path, State},
    http::StatusCode,
};
use bson::doc;
use mongodb::bson::oid::ObjectId;

use crate::{
    AppState, Model,
    error::AppResult,
    middlewares::UserContext,
    portfolio::models::{AccountStatement, Dividend, OpenPosition, PortfolioAccount},
};

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
    Path((account_id, statement_id)): Path<(ObjectId, ObjectId)>,
) -> AppResult<StatusCode> {
    let account_collection = PortfolioAccount::get_collection(&state)?;
    let statement_collection = AccountStatement::get_collection(&state)?;

    let account = account_collection
        .find_one(doc! { "user_id": context.user_id, "_id": account_id })
        .await
        .context("Failed to get account")?;
    if account.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::NOT_FOUND)
                .with_title("Not found")
                .with_detail("Could not find account with this id in portfolio.")
                .into(),
        );
    }

    let statement = statement_collection
        .find_one(doc! { "account_id": account_id, "_id": statement_id })
        .await
        .context("Failed to get statement")?;
    if statement.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::NOT_FOUND)
                .with_title("Not found")
                .with_detail("Could not find statement with this id in account.")
                .into(),
        );
    }

    Dividend::get_collection(&state)?
        .delete_many(doc! { "statement_id": statement_id })
        .await
        .context("Failed to delete statement's dividends")?;
    OpenPosition::get_collection(&state)?
        .delete_many(doc! { "statement_id": statement_id })
        .await
        .context("Failed to delete statement's open positions")?;

    statement_collection
        .delete_one(doc! { "account_id": account_id, "_id": statement_id })
        .await
        .context("Failed to delete statement")?;

    Ok(StatusCode::NO_CONTENT)
}
