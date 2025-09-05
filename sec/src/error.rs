#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("{0:#}")]
    Anyhow(#[from] anyhow::Error),
    #[error("Not found: {0}")]
    NotFound(String),
}