use anyhow::Context;
use axum::{
    Extension, Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use bson::oid::ObjectId;
use futures_util::TryStreamExt;
use mongodb::bson::doc;
use serde::Serialize;

use crate::{
    AppState, Model,
    error::AppResult,
    middlewares::UserContext,
    pagination::{Pagination, PaginationData},
    portfolio::{
        dto,
        models::{AccountStatement, PortfolioAccount},
    },
};

#[derive(Serialize)]
pub struct ListStatementsResponse {
    pub statements: Vec<dto::AccountStatement>,
    pub pagination: PaginationData,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
    Path(account_id): Path<ObjectId>,
    Query(pagination): Query<Pagination>,
) -> AppResult<Json<ListStatementsResponse>> {
    let collection = AccountStatement::get_collection(&state)?;

    let account = PortfolioAccount::get_collection(&state)?
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
        .context("Failed to count accounts")? as i64;
    let statements = collection
        .find(filter)
        .sort(doc! { "end": -1 })
        .skip(pagination.offset)
        .limit(pagination.limit)
        .await
        .context("Failed to list accounts")?
        .try_collect::<Vec<_>>()
        .await
        .context("Failed to collect accounts")?
        .iter()
        .map(dto::AccountStatement::from)
        .collect();

    Ok(Json(ListStatementsResponse {
        statements,
        pagination: PaginationData {
            total_count,
            offset: pagination.offset,
            limit: pagination.limit,
            has_next: total_count > pagination.offset as i64 + pagination.limit,
            has_prev: pagination.offset > 0,
        },
    }))
}
