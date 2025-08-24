use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::portfolio::models;

#[derive(Debug, Serialize, Deserialize)]
pub enum Platform {
    IBKR,
}

impl From<&models::Platform> for Platform {
    fn from(value: &models::Platform) -> Self {
        match value {
            models::Platform::IBKR => Platform::IBKR,
        }
    }
}

impl From<models::Platform> for Platform {
    fn from(value: models::Platform) -> Self {
        Platform::from(&value)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortfolioAccount {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub platform: Platform,
    pub base_currency: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<&models::PortfolioAccount> for PortfolioAccount {
    fn from(value: &models::PortfolioAccount) -> Self {
        Self {
            id: value.id.unwrap().to_string(),
            user_id: value.user_id.to_string(),
            name: value.name.clone(),
            platform: value.platform.clone().into(),
            base_currency: value.base_currency.clone(),
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

impl From<models::PortfolioAccount> for PortfolioAccount {
    fn from(value: models::PortfolioAccount) -> Self {
        PortfolioAccount::from(&value)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenPosition {
    pub id: String,
    pub account_id: String,
    pub symbol: String,
    pub quantity: Decimal,
    pub cost_price: Decimal,
    pub currency: String,
}

impl From<&models::OpenPosition> for OpenPosition {
    fn from(value: &models::OpenPosition) -> Self {
        Self {
            id: value.id.unwrap().to_string(),
            account_id: value.account_id.to_string(),
            symbol: value.symbol.clone(),
            quantity: value.quantity,
            cost_price: value.cost_price,
            currency: value.currency.clone(),
        }
    }
}

impl From<models::OpenPosition> for OpenPosition {
    fn from(value: models::OpenPosition) -> Self {
        OpenPosition::from(&value)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Dividend {
    pub id: String,
    pub account_id: String,
    pub symbol: String,
    pub date: chrono::DateTime<chrono::Utc>,
    pub amount: Decimal,
    pub currency: String,
}

impl From<&models::Dividend> for Dividend {
    fn from(value: &models::Dividend) -> Self {
        Self {
            id: value.id.unwrap().to_string(),
            account_id: value.account_id.to_string(),
            symbol: value.symbol.clone(),
            date: value.date,
            amount: value.amount,
            currency: value.currency.clone(),
        }
    }
}

impl From<models::Dividend> for Dividend {
    fn from(value: models::Dividend) -> Self {
        Dividend::from(&value)
    }
}
