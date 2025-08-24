use anyhow::Context;
use axum::{Json, extract::State, http::StatusCode};
use mongodb::bson::doc;
use scrypt::{
    Scrypt,
    password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
};
use serde::Deserialize;

use crate::{error::AppResult, user::models::User, AppState, Model};

#[derive(Deserialize)]
pub struct RegisterPayload {
    email: String,
    password: String,
}

pub async fn handler(
    State(state): State<AppState>,
    Json(payload): Json<RegisterPayload>,
) -> AppResult<()> {
    let collection = User::get_collection(&state)?;

    if payload.email.is_empty() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::CONFLICT)
                .with_title("Invalid email")
                .with_detail("An email must be provided.")
                .into(),
        );
    }

    if payload.password.len() < 8
        || !payload.password.chars().any(|x| x.is_ascii_lowercase())
        || !payload.password.chars().any(|x| x.is_ascii_uppercase())
        || !payload.password.chars().any(|x| x.is_ascii_digit())
        || !payload.password.chars().any(|x| x.is_ascii_punctuation())
    {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                .with_title("Invalid password")
                .with_detail("Password must be at least 8 characters long, and contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character.")
                .into(),
        );
    }

    if let Some(_) = collection
        .find_one(doc! { "email": &payload.email })
        .await
        .context("Failed to check if user exists")?
    {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::CONFLICT)
                .with_title("User already exists")
                .with_detail("A user with this email already exists.")
                .into(),
        );
    }

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Scrypt
        .hash_password(payload.password.as_bytes(), &salt)
        .context("Failed to hash password")?
        .to_string();

    let now = chrono::Utc::now();
    let _ = collection
        .insert_one(User {
            id: None,
            email: payload.email,
            password: password_hash,
            last_password_update: now,
            cash_flow: vec![],
            created_at: now,
            updated_at: now,
        })
        .await
        .context("Failed to create user")?;

    Ok(())
}
