use serde::{Deserialize, Serialize};

use super::models;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password: String,
    pub last_password_update: chrono::DateTime<chrono::Utc>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<&models::User> for User {
    fn from(value: &models::User) -> Self {
        Self {
            id: value.id.unwrap().to_string(),
            email: value.email.clone(),
            password: value.password.clone(),
            last_password_update: value.last_password_update,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

impl From<models::User> for User {
    fn from(value: models::User) -> Self {
        User::from(&value)
    }
}
