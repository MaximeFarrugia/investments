mod financial;

use axum::routing::get;

use crate::AppState;

pub fn init_router(state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/", get(financial::handler))
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middlewares::is_auth,
        ))
}
