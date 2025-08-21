use anyhow::Context;
use axum::{
    Json,
    extract::{Path, Query, State},
};
use futures_util::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};
use serde::Serialize;

use crate::{
    AppState, Model,
    error::AppResult,
    pagination::{Pagination, PaginationData},
    portfolio::models::Dividend,
};

#[derive(Serialize)]
pub struct DividendsResponse {
    pub dividends: Vec<Dividend>,
    pub pagination: PaginationData,
}

pub async fn handler(
    State(state): State<AppState>,
    Path(account_id): Path<ObjectId>,
    Query(pagination): Query<Pagination>,
) -> AppResult<Json<DividendsResponse>> {
    let collection = Dividend::get_collection(&state)?;
    let filter = doc! { "account_id": account_id };

    let total_count = collection
        .count_documents(filter.clone())
        .await
        .context("Failed to count dividends")? as i64;
    let dividends = collection
        .find(filter)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .await
        .context("Failed to list dividends")?
        .try_collect::<Vec<Dividend>>()
        .await
        .context("Failed to collect dividends")?;

    Ok(Json(DividendsResponse {
        dividends,
        pagination: PaginationData {
            total_count,
            offset: pagination.offset,
            limit: pagination.limit,
            has_next: total_count > pagination.offset as i64 + pagination.limit,
            has_prev: pagination.offset > 0,
        },
    }))
}
