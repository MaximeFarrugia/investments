use anyhow::Context;
use axum::{Json, extract::Query};
use bson::doc;
use sec::{SecClient, company_facts::Facts};
use serde::{Deserialize, Serialize};

use crate::error::AppResult;

#[derive(Deserialize)]
pub struct IncomeStatementQuery {
    pub symbol: String,
    pub annual: Option<bool>,
}

#[derive(Serialize)]
pub struct IncomeStatementResponse {
    pub facts: Facts,
}

pub async fn handler(
    Query(query): Query<IncomeStatementQuery>,
) -> AppResult<Json<IncomeStatementResponse>> {
    let client =
        SecClient::new(dotenvy::var("EDGAR_IDENTITY").context("Get EDGAR_IDENTITY from env")?)?;
    let mut company = sec::company::Company::get_company(&query.symbol, &client).await?;

    company.facts = match query.annual {
        Some(false) => company.facts.quarterly(),
        _ => company.facts.annual(),
    };

    Ok(Json(IncomeStatementResponse {
        facts: company.facts.facts,
    }))
}
