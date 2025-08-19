mod error;
mod users;

use anyhow::Context;

#[derive(Clone)]
pub struct AppState {
    pub db: mongodb::Client,
}

fn init_router(state: AppState) -> axum::Router {
    axum::Router::new()
        .nest("/users", users::init_router())
        .with_state(state)
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
