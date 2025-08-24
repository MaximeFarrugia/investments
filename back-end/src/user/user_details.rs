use anyhow::Context;
use axum::{Extension, Json, extract::State, http::StatusCode};
use mongodb::bson::doc;
use serde::Serialize;

use crate::{error::AppResult, middlewares::UserContext, user::{dto, models::User}, AppState, Model};

#[derive(Serialize)]
pub struct UserDetailsResponse {
    pub user: dto::User,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
) -> AppResult<Json<UserDetailsResponse>> {
    let collection = User::get_collection(&state)?;
    let filter = doc! { "_id": context.user_id };

    let user = collection
        .find_one(filter)
        .await
        .context("Failed to get account")?;

    if user.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::NOT_FOUND)
                .with_title("Not found")
                .with_detail("Could not find authenticated user.")
                .into(),
        );
    }

    Ok(Json(UserDetailsResponse {
        user: user.unwrap().into(),
    }))
}
