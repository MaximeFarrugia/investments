use anyhow::Context;
use axum::{
    Extension, Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use futures_util::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};
use serde::Serialize;

use crate::{
    AppState, Model,
    error::AppResult,
    middlewares::UserContext,
    pagination::{Pagination, PaginationData},
    portfolio::{
        dto,
        models::{OpenPosition, PortfolioAccount},
    },
};

#[derive(Serialize)]
pub struct OpenPositionsResponse {
    pub open_positions: Vec<dto::OpenPosition>,
    pub pagination: PaginationData,
}

pub async fn handler(
    State(state): State<AppState>,
    Path(account_id): Path<ObjectId>,
    Query(pagination): Query<Pagination>,
    Extension(context): Extension<UserContext>,
) -> AppResult<Json<OpenPositionsResponse>> {
    let collection = OpenPosition::get_collection(&state)?;
    let account_collection = PortfolioAccount::get_collection(&state)?;

    let account = account_collection
        .find_one(doc! {
            "_id": account_id,
            "user_id": context.user_id,
        })
        .await
        .context("Failed to check if account exists")?;
    if account.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::FORBIDDEN)
                .with_title("Not found")
                .with_detail("Could not find account with this id in portfolio.")
                .into(),
        );
    }

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
        .context("Failed to collect open positions")?
        .iter()
        .map(dto::OpenPosition::from)
        .collect();

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
