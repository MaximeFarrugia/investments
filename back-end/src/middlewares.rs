use anyhow::Context;
use axum::{
    Extension,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use axum_extra::extract::CookieJar;
use mongodb::bson::doc;

use crate::{
    AppState, Model,
    error::{AppError, AppResult},
    users::models::AuthToken,
};

#[derive(Clone)]
pub struct UserContext {
    pub user_id: Option<mongodb::bson::oid::ObjectId>,
}

pub async fn base(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> AppResult<Response> {
    let mut jar = CookieJar::from_headers(&request.headers());
    let mut context = UserContext { user_id: None };

    if let Some(token) = jar.get("auth_token").map(|x| x.value()) {
        let tokens_collection = AuthToken::get_collection(&state)?;
        if let Some(token) = tokens_collection
            .find_one(doc! { "token": token })
            .await
            .context("Failed to find auth token")?
        {
            if token.expires_at > chrono::Utc::now() {
                context.user_id = Some(token.user_id);
            } else {
                jar = jar.remove("auth_token");
                return Ok((
                    jar,
                    AppError::ProblemDetails(
                        problem_details::ProblemDetails::from_status_code(StatusCode::UNAUTHORIZED)
                            .with_title("Token expired")
                            .with_detail(
                                "Your authentication token has expired. Please log in again.",
                            ),
                    ),
                )
                    .into_response());
            }
        }
    }
    request.extensions_mut().insert(context);
    Ok(next.run(request).await)
}

pub async fn is_auth(
    Extension(context): Extension<UserContext>,
    request: Request,
    next: Next,
) -> Response {
    if context.user_id.is_none() {
        return AppError::ProblemDetails(
            problem_details::ProblemDetails::from_status_code(StatusCode::UNAUTHORIZED)
                .with_title("Unauthorized")
                .with_detail("You must be logged in to access this resource."),
        )
        .into_response();
    }
    next.run(request).await
}
