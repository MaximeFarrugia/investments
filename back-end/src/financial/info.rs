use anyhow::Context;
use axum::{Json, extract::Query};
use bson::doc;
use sec::SecClient;
use serde::{Deserialize, Serialize};

use crate::error::AppResult;

#[derive(Deserialize)]
pub struct InfoQuery {
    pub symbol: String,
}

#[derive(Serialize)]
pub struct InfoResponse {
    pub ticker: String,
    pub name: String,
    pub cik: usize,
}

pub async fn handler(Query(query): Query<InfoQuery>) -> AppResult<Json<InfoResponse>> {
    let client =
        SecClient::new(dotenvy::var("EDGAR_IDENTITY").context("Get EDGAR_IDENTITY from env")?)?;
    let company = sec::company::Company::get_company(&query.symbol, &client).await?;

    Ok(Json(InfoResponse {
        ticker: company.ticker,
        name: company.name,
        cik: company.cik,
    }))
}
