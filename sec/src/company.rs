use std::collections::HashMap;

use anyhow::Context;
use serde::Deserialize;

use crate::SecClient;

#[derive(Debug)]
pub struct Company {
    pub ticker: String,
    pub cik: usize,
    pub name: String,
}

#[derive(Deserialize)]
struct CompanyTickerData {
    pub(crate) cik_str: usize,
    pub(crate) ticker: String,
    pub(crate) title: String,
}

impl Company {
    pub async fn get_company(ticker: &str, client: &SecClient) -> Result<Self, crate::Error> {
        let ticker = ticker.to_uppercase().replace(".", "-");
        let tickers = client
            .http
            .get("https://www.sec.gov/files/company_tickers.json")
            .send()
            .await
            .context("Get ticker list from SEC")?
            .json::<HashMap<String, CompanyTickerData>>()
            .await
            .context("Parse SEC's ticker list to json")?;

        let ticker_data = tickers.iter().find(|x| x.1.ticker == ticker);

        match ticker_data {
            Some((_, ticker_data)) => Ok(Self {
                ticker: ticker_data.ticker.to_owned(),
                cik: ticker_data.cik_str,
                name: ticker_data.title.to_owned(),
            }),
            None => Err(crate::Error::NotFound(ticker.to_owned())),
        }
    }
}
