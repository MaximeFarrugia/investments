use anyhow::Context;
use axum::{
    Extension, Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use futures_util::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};

use crate::{
    AppState, Model,
    error::AppResult,
    middlewares::UserContext,
    portfolio::{
        dto,
        models::{Dividend, PortfolioAccount},
    },
};

#[derive(Deserialize)]
pub struct DividendsQuery {
    start_date: chrono::DateTime<chrono::Utc>,
    end_date: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize)]
pub struct DividendsResponse {
    pub dividends: Vec<dto::Dividend>,
}

pub async fn handler(
    State(state): State<AppState>,
    Path(account_id): Path<ObjectId>,
    Query(query): Query<DividendsQuery>,
    Extension(context): Extension<UserContext>,
) -> AppResult<Json<DividendsResponse>> {
    let dividend_collection = Dividend::get_collection(&state)?;
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

    let filter = doc! {
        "account_id": account_id,
        "$and": [
            doc! { "date": doc! { "$gte": query.start_date } },
            doc! { "date": doc! { "$lt": query.end_date } },
        ]
    };

    let dividends = dividend_collection
        .find(filter)
        .await
        .context("Failed to list dividends")?
        .try_collect::<Vec<Dividend>>()
        .await
        .context("Failed to collect dividends")?
        .iter()
        .map(dto::Dividend::from)
        .collect();

    Ok(Json(DividendsResponse { dividends }))
}
