pub mod company;
pub mod company_facts;
mod error;

use anyhow::Context;
pub use error::Error;

pub struct SecClient {
    pub(crate) http: reqwest::Client,
}

impl SecClient {
    pub fn new(identity: impl Into<String>) -> Result<Self, Error> {
        let http = reqwest::Client::builder()
            .user_agent(identity.into())
            .build()
            .context("Building http client")?;
        Ok(Self { http })
    }
}
