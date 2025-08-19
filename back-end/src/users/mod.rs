mod models;
mod login;
mod register;

use axum::routing::post;

use crate::AppState;

pub fn init_router() -> axum::Router<AppState> {
    axum::Router::new()
        .route("/login", post(login::handler))
        .route("/register", post(register::handler))
}
