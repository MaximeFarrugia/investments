use mongodb::bson::oid::ObjectId;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::Model;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub _id: ObjectId,
    pub email: String,
    pub password: String,
    pub last_password_update: chrono::DateTime<chrono::Utc>,
    pub cash_flow: Vec<CashFlow>,
    pub open_positions: Vec<OpenPosition>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl Model for User {
    const COLLECTION_NAME: &'static str = "users";
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CashFlow {
    pub from: String,
    pub to: String,
    pub amount: Decimal,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenPosition {
    pub symbol: String,
    pub quantity: Decimal,
    pub cost_price: Decimal,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthToken {
    pub _id: ObjectId,
    pub user_id: ObjectId,
    pub token: String,
    pub expires_at: chrono::DateTime<chrono::Utc>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl Model for AuthToken {
    const COLLECTION_NAME: &'static str = "auth_tokens";
}
