pub mod open_positions;
pub mod dividends;

use anyhow::Context;
use axum::{
    Extension, Json,
    extract::{Path, State},
    http::StatusCode,
};
use mongodb::bson::{doc, oid::ObjectId};
use serde::Serialize;

use crate::{
    AppState, Model, error::AppResult, middlewares::UserContext,
    portfolio::models::PortfolioAccount,
};

#[derive(Serialize)]
pub struct AccountDetailsResponse {
    pub account: PortfolioAccount,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
    Path(account_id): Path<ObjectId>,
) -> AppResult<Json<AccountDetailsResponse>> {
    let collection = PortfolioAccount::get_collection(&state)?;
    let filter = doc! { "user_id": context.user_id, "_id": account_id };

    let account = collection
        .find_one(filter)
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

    Ok(Json(AccountDetailsResponse {
        account: account.unwrap(),
    }))
}
