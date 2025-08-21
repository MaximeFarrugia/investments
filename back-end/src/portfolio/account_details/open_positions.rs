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
    portfolio::models::OpenPosition,
};

#[derive(Serialize)]
pub struct OpenPositionsResponse {
    pub open_positions: Vec<OpenPosition>,
    pub pagination: PaginationData,
}

pub async fn handler(
    State(state): State<AppState>,
    Path(account_id): Path<ObjectId>,
    Query(pagination): Query<Pagination>,
) -> AppResult<Json<OpenPositionsResponse>> {
    let collection = OpenPosition::get_collection(&state)?;
    let filter = doc! { "account_id": account_id };

    let total_count = collection
        .count_documents(filter.clone())
        .await
        .context("Failed to count open positions")? as i64;
    let open_positions = collection
        .find(filter)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .await
        .context("Failed to list open positions")?
        .try_collect::<Vec<OpenPosition>>()
        .await
        .context("Failed to collect open positions")?;

    Ok(Json(OpenPositionsResponse {
        open_positions,
        pagination: PaginationData {
            total_count,
            offset: pagination.offset,
            limit: pagination.limit,
            has_next: total_count > pagination.offset as i64 + pagination.limit,
            has_prev: pagination.offset > 0,
        },
    }))
}
