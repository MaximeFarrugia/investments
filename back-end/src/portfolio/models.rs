use mongodb::bson::oid::ObjectId;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::Model;

#[derive(Debug, Serialize, Deserialize)]
pub enum Platform {
    IBKR,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortfolioAccount {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId,
    pub name: String,
    pub platform: Platform,
    pub base_currency: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl Model for PortfolioAccount {
    const COLLECTION_NAME: &'static str = "accounts";
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenPosition {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub account_id: ObjectId,
    pub symbol: String,
    pub quantity: Decimal,
    pub cost_price: Decimal,
    pub currency: String,
}

impl Model for OpenPosition {
    const COLLECTION_NAME: &'static str = "open_positions";
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Dividend {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub account_id: ObjectId,
    pub symbol: String,
    pub date: chrono::NaiveDate,
    pub amount: Decimal,
    pub currency: String,
}

impl Model for Dividend {
    const COLLECTION_NAME: &'static str = "dividends";
}
