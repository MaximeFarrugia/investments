use anyhow::Context;
use axum::{
    Extension, Json,
    extract::{Path, State},
    http::StatusCode,
};
use axum_extra::extract::Multipart;
use bson::doc;
use mongodb::bson::oid::ObjectId;
use serde::Serialize;

use crate::{
    AppState, Model,
    error::AppResult,
    middlewares::UserContext,
    portfolio::{
        models::{Platform, PortfolioAccount},
        platform,
    },
};

#[derive(Serialize)]
pub struct NewStatementResponse {
    statement_id: String,
}

async fn handle_file(
    state: &AppState,
    account_id: &ObjectId,
    platform: Platform,
    file_content: String,
) -> AppResult<String> {
    match platform {
        Platform::IBKR => platform::ibkr::new_statement(state, account_id, file_content).await,
    }
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(context): Extension<UserContext>,
    Path(account_id): Path<ObjectId>,
    mut multipart: Multipart,
) -> AppResult<Json<NewStatementResponse>> {
    let mut file_content: Option<String> = None;

    let collection = PortfolioAccount::get_collection(&state)?;
    let account = collection
        .find_one(doc! { "user_id": context.user_id, "_id": account_id })
        .await
        .context("Failed to get account")?;
    if account.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::NOT_FOUND)
                .with_title("Not found")
                .with_detail("Could not find account with this id in portfolio.")
                .into(),
        );
    }

    while let Some(field) = multipart
        .next_field()
        .await
        .context("Failed to read multipart's next field")?
    {
        match field.name() {
            Some("file") => {
                if let Ok(text) = field.text().await {
                    file_content = Some(text);
                }
            }
            _ => (),
        };
    }

    if file_content.is_none() {
        return Err(
            problem_details::ProblemDetails::from_status_code(StatusCode::BAD_REQUEST)
                .with_title("Missing file")
                .with_detail("The file content is empty.")
                .into(),
        );
    }

    let statement_id = handle_file(
        &state,
        &account_id,
        account.unwrap().platform,
        file_content.unwrap(),
    )
    .await?;

    Ok(Json(NewStatementResponse { statement_id }))
}
