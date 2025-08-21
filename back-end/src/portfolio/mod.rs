pub mod models;
mod platform;
mod new_account;
mod list_accounts;
mod account_details;
// mod update_account;

use axum::routing::{get, post, put};

use crate::AppState;

pub fn init_router(state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/accounts", post(new_account::handler))
        .route("/accounts", get(list_accounts::handler))
        .route("/accounts/{account_id}", get(account_details::handler))
        .route("/accounts/{account_id}/open_positions", get(account_details::open_positions::handler))
        .route("/accounts/{account_id}/dividends", get(account_details::dividends::handler))
        // .route("/accounts/{account_id}", put(update_account::handler))
        .layer(axum::middleware::from_fn_with_state(state, crate::middlewares::is_auth))
}
