use anyhow::Context;
use axum::{
    Json,
    extract::{Path, Query, State},
};
use futures_util::TryStreamExt;
use mongodb::bson::{doc, oid::ObjectId};
use serde::{Deserialize, Serialize};

use crate::{
    AppState, Model,
    error::AppResult,
    portfolio::{dto, models::Dividend},
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
) -> AppResult<Json<DividendsResponse>> {
    let collection = Dividend::get_collection(&state)?;
    let filter = doc! {
        "account_id": account_id,
        "$and": [
            doc! { "date": doc! { "$gte": query.start_date } },
            doc! { "date": doc! { "$lt": query.end_date } },
        ]
    };

    let dividends = collection
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
