mod account_details;
pub mod dto;
mod list_accounts;
pub mod models;
mod new_account;
mod platform;
mod statement;

use axum::routing::{delete, get, post};

use crate::AppState;

pub fn init_router(state: AppState) -> axum::Router<AppState> {
    axum::Router::new()
        .route("/accounts", post(new_account::handler))
        .route("/accounts", get(list_accounts::handler))
        .route("/accounts/{account_id}", get(account_details::handler))
        .route(
            "/accounts/{account_id}/open_positions",
            get(account_details::open_positions::handler),
        )
        .route(
            "/accounts/{account_id}/dividends",
            get(account_details::dividends::handler),
        )
        .route(
            "/accounts/{account_id}/statements",
            get(statement::list_statements::handler),
        )
        .route(
            "/accounts/{account_id}/statements",
            post(statement::new_statement::handler),
        )
        .route(
            "/accounts/{account_id}/statements/{statement_id}",
            delete(statement::delete_statement::handler),
        )
        .layer(axum::middleware::from_fn_with_state(
            state,
            crate::middlewares::is_auth,
        ))
}
