use anyhow::Context;
use axum::{Json, extract::Query};
use bson::doc;
use sec::{SecClient, company_facts::Facts};
use serde::{Deserialize, Serialize};

use crate::error::AppResult;

#[derive(Deserialize)]
pub struct FactsQuery {
    pub symbol: String,
    pub annual: Option<bool>,
}

#[derive(Serialize)]
pub struct FactsResponse {
    pub facts: Facts,
}

pub async fn handler(
    Query(query): Query<FactsQuery>,
) -> AppResult<Json<FactsResponse>> {
    let client =
        SecClient::new(dotenvy::var("EDGAR_IDENTITY").context("Get EDGAR_IDENTITY from env")?)?;
    let company = sec::company::Company::get_company(&query.symbol, &client).await?;
    let mut facts = sec::company_facts::CompanyFacts::get_facts(company.cik.to_string(), &client).await?;

    facts = match query.annual {
        Some(false) => facts.quarterly(),
        _ => facts.annual(),
    };

    Ok(Json(FactsResponse {
        facts: facts.facts,
    }))
}
