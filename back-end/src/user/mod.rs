pub mod dto;
mod login;
pub mod models;
mod register;
mod user_details;

use axum::routing::{get, post};

use crate::AppState;

pub fn init_router(state: AppState) -> axum::Router<AppState> {
    let auth_router = axum::Router::new()
        .route("/", get(user_details::handler))
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middlewares::is_auth,
        ));

    axum::Router::new()
        .merge(auth_router)
        .route("/login", post(login::handler))
        .route("/register", post(register::handler))
}
