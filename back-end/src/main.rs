mod error;
mod middlewares;
mod user;

use anyhow::Context;

use crate::error::AppResult;

#[derive(Clone)]
pub struct AppState {
    pub db: mongodb::Client,
}

pub trait Model {
    const COLLECTION_NAME: &'static str;

    fn get_collection(state: &AppState) -> AppResult<mongodb::Collection<Self>>
    where
        Self: Send + Sync + Sized,
    {
        Ok(state
            .db
            .default_database()
            .context("Get default database")?
            .collection::<Self>(Self::COLLECTION_NAME))
    }
}

fn init_router(state: AppState) -> axum::Router {
    axum::Router::new()
        .nest("/user", user::init_router(state.clone()))
        .with_state(state.clone())
        .layer(axum::middleware::from_fn_with_state(
            state,
            middlewares::base,
        ))
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv()?;
    let address = format!(
        "{}:{}",
        dotenvy::var("BACKEND_HOST").context("Get BACKEND_HOST from env")?,
        dotenvy::var("BACKEND_PORT").context("Get BACKEND_PORT from env")?
    );
    let listener = tokio::net::TcpListener::bind(&address)
        .await
        .context("Failed to bind TCP listener")?;

    let db = mongodb::Client::with_options(
        mongodb::options::ClientOptions::builder()
            .hosts(vec![
                mongodb::options::ServerAddress::parse(format!(
                    "{}:{}",
                    dotenvy::var("MONGO_HOST").context("Get MONGO_HOST from env")?,
                    dotenvy::var("MONGO_PORT").context("Get MONGO_PORT from env")?,
                ))
                .context("Parse MONGO_URI to ServerAddress")?,
            ])
            .credential(
                mongodb::options::Credential::builder()
                    .username(dotenvy::var("MONGO_USER").context("Get MONGO_USER from env")?)
                    .password(dotenvy::var("MONGO_PASS").context("Get MONGO_PASS from env")?)
                    .build(),
            )
            .default_database(Some(
                dotenvy::var("MONGO_DB").context("Get MONGO_DB from env")?,
            ))
            .build(),
    )
    .context("Failed to create MongoDB client")?;

    let state = AppState { db };

    println!("Listening on {address}");
    axum::serve(listener, init_router(state))
        .await
        .context("Failed to start server")?;
    Ok(())
}
