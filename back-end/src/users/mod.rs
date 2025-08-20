mod login;
pub mod models;
mod register;

use axum::routing::post;

use crate::AppState;

pub fn init_router(state: AppState) -> axum::Router<AppState> {
    let auth_router = axum::Router::new()
        .route("/test", axum::routing::get(|| async { "wef" }))
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middlewares::is_auth,
        ));

    axum::Router::new()
        .route("/login", post(login::handler))
        .route("/register", post(register::handler))
        .merge(auth_router)
}
