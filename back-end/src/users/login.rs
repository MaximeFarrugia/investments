use anyhow::Context;
use axum::{Json, extract::State, http::StatusCode};
use chrono::Duration;
use mongodb::bson::{doc, uuid};
use scrypt::{
    Scrypt,
    password_hash::{PasswordHash, PasswordVerifier},
};
use serde::Deserialize;

use crate::{
    AppState,
    error::AppResult,
    users::models::{AuthToken, User},
};

#[derive(Deserialize)]
pub struct LoginPayload {
    email: String,
    password: String,
}

#[derive(serde::Serialize)]
pub struct LoginResponse {
    token: String,
    expires_at: chrono::DateTime<chrono::Utc>,
}

pub async fn handler(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> AppResult<Json<LoginResponse>> {
    let database = state
        .db
        .default_database()
        .context("Get default database")?;
    let users_collection = database.collection::<User>("users");
    let tokens_collection = database.collection::<AuthToken>("auth_tokens");

    let user = users_collection
        .find_one(doc! { "email": &payload.email })
        .await
        .context("Failed to check if user exists")?;

    if user.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                .with_title("Invalid user")
                .with_detail("Email or password invalid.")
                .into(),
        );
    }

    let user = user.unwrap();
    let parsed_hash = PasswordHash::new(&user.password).context("Failed to parse password hash")?;
    if Scrypt
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                .with_title("Invalid user")
                .with_detail("Email or password invalid.")
                .into(),
        );
    }

    let now = chrono::Utc::now();
    let token = tokens_collection
        .insert_one(AuthToken {
            _id: mongodb::bson::oid::ObjectId::new(),
            user_id: user._id,
            token: uuid::Uuid::new().to_string(),
            expires_at: now
                .checked_add_signed(Duration::hours(1))
                .context("Failed to calculate token expiration")?,
            created_at: now,
        })
        .await
        .context("Failed to create auth token")?;
    let token = tokens_collection
        .find_one(doc! { "_id": token.inserted_id })
        .await
        .context("Failed to retrieve auth token")?
        .ok_or_else(|| {
            problem_details::ProblemDetails::from_status_code(StatusCode::INTERNAL_SERVER_ERROR)
                .with_title("Token not found")
                .with_detail("Failed to retrieve the created auth token.")
        });

    if let Err(err) = token {
        return Err(err.into());
    }
    let token = token.unwrap();

    Ok(LoginResponse {
        token: token.token,
        expires_at: token.expires_at,
    }
    .into())
}
