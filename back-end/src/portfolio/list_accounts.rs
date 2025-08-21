use anyhow::Context;
use axum::{
    Extension, Json,
    extract::{Query, State},
};
use futures_util::TryStreamExt;
use mongodb::bson::doc;
use serde::Serialize;

use crate::{
    AppState, Model,
    error::AppResult,
    middlewares::UserContext,
    pagination::{Pagination, PaginationData},
    portfolio::models::PortfolioAccount,
};

#[derive(Serialize)]
pub struct ListAccountsResponse {
    pub accounts: Vec<PortfolioAccount>,
    pub pagination: PaginationData,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
    Query(pagination): Query<Pagination>,
) -> AppResult<Json<ListAccountsResponse>> {
    let collection = PortfolioAccount::get_collection(&state)?;
    let filter = doc! { "user_id": context.user_id };

    let total_count = collection
        .count_documents(filter.clone())
        .await
        .context("Failed to count accounts")? as i64;
    let accounts = collection
        .find(filter)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .await
        .context("Failed to list accounts")?
        .try_collect::<Vec<PortfolioAccount>>()
        .await
        .context("Failed to collect accounts")?;

    Ok(Json(ListAccountsResponse {
        accounts,
        pagination: PaginationData {
            total_count,
            offset: pagination.offset,
            limit: pagination.limit,
            has_next: total_count > pagination.offset as i64 + pagination.limit,
            has_prev: pagination.offset > 0,
        },
    }))
}
