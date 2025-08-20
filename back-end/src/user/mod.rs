mod login;
pub mod models;
mod register;

use axum::routing::post;

use crate::AppState;

pub fn init_router(state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/login", post(login::handler))
        .route("/register", post(register::handler))
}
