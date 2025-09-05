use anyhow::Context;

use crate::{SecClient, company_facts::CompanyFacts};

#[derive(Debug)]
pub struct Company {
    pub ticker: String,
    pub cik: usize,
    pub name: String,
    pub facts: CompanyFacts,
}

impl Company {
    pub async fn get_company(ticker: &str, client: &SecClient) -> Result<Self, crate::Error> {
        let ticker = ticker.to_lowercase().replace(".", "-");
        let tickers = client
            .http
            .get("https://www.sec.gov/include/ticker.txt")
            .send()
            .await
            .context("Get ticker list from SEC")?
            .text()
            .await
            .context("Parse SEC's ticker list to text")?;
        let ticker_data = tickers
            .split("\n")
            .map(|x| x.split("\t").collect::<Vec<_>>())
            .find(|x| x[0] == ticker);

        match ticker_data {
            Some(ticker_data) => {
                let cik = ticker_data[1]
                    .parse::<usize>()
                    .context("Parsing ticker's cik to usize")?;
                let facts = CompanyFacts::get_facts(cik.to_string(), client).await?;
                Ok(Self {
                    ticker: ticker_data[0].to_owned(),
                    cik,
                    name: facts.entity_name.to_owned(),
                    facts,
                })
            }
            None => Err(crate::Error::NotFound(ticker.to_owned())),
        }
    }
}
