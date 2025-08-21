use anyhow::Context;
use axum::{Extension, Json, extract::State, http::StatusCode};
use axum_extra::extract::Multipart;
use mongodb::bson::oid::ObjectId;
use serde::Serialize;

use crate::{AppState, error::AppResult, middlewares::UserContext, portfolio::models::Platform};

#[derive(Serialize)]
pub struct NewAccountResponse {
    account_id: String,
}

async fn handle_file(
    state: &AppState,
    user_id: &ObjectId,
    platform: Platform,
    file_content: String,
) -> AppResult<String> {
    match platform {
        Platform::IBKR => super::platform::ibkr::new_account(state, user_id, file_content).await,
    }
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
    mut multipart: Multipart,
) -> AppResult<Json<NewAccountResponse>> {
    let mut platform: Option<Platform> = None;
    let mut file_content: Option<String> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .context("Failed to read multipart's next field")?
    {
        match field.name() {
            Some("platform") => {
                platform = Some(
                    serde_json::from_str(
                        field
                            .text()
                            .await
                            .context("Failed to get platform value")?
                            .as_str(),
                    )
                    .map_err(|_| {
                        problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                            .with_title("Invalid platform")
                            .with_detail("The specified platform is not supported.")
                    })?,
                )
            }
            Some("file") => {
                if let Ok(text) = field.text().await {
                    file_content = Some(text);
                }
            }
            _ => (),
        };
    }

    if platform.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                .with_title("Missing platform")
                .with_detail("The platform is required.")
                .into(),
        );
    }
    if file_content.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                .with_title("Missing file")
                .with_detail("The file content is empty.")
                .into(),
        );
    }

    let account_id = handle_file(
        &state,
        &context.user_id.unwrap(),
        platform.unwrap(),
        file_content.unwrap(),
    )
    .await?;

    Ok(Json(NewAccountResponse { account_id }))
}
