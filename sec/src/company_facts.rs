use std::{
    cmp::Reverse,
    collections::{HashMap, HashSet},
};

use anyhow::Context;
use chrono::Datelike;
use regex::Regex;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::SecClient;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompanyFacts {
    pub cik: Cik,
    #[serde(rename = "entityName")]
    pub entity_name: String,
    pub facts: Facts,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Cik {
    String(String),
    Number(usize),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Facts {
    pub dei: HashMap<String, Concept>,
    #[serde(rename = "us-gaap")]
    pub us_gaap: HashMap<String, Concept>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Concept {
    pub label: Option<String>,
    pub description: Option<String>,
    pub units: HashMap<String, Vec<UnitValue>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnitValue {
    pub start: Option<chrono::NaiveDate>,
    pub end: chrono::NaiveDate,
    pub val: Decimal,
    pub accn: String,
    pub fy: Option<i32>,
    pub fp: Option<String>,
    pub form: String,
    pub filed: chrono::NaiveDate,
    pub frame: Option<String>,
}

impl CompanyFacts {
    pub async fn get_facts(
        cik: impl Into<String>,
        client: &SecClient,
    ) -> Result<Self, crate::Error> {
        let cik = format!("CIK{:0>10}", cik.into());
        let facts = client
            .http
            .get(format!(
                "https://data.sec.gov/api/xbrl/companyfacts/{cik}.json"
            ))
            .send()
            .await
            .context("Get company facts list from SEC")?
            .json::<Self>()
            .await
            .context("Parse SEC's company facts to json")?;
        Ok(facts)
    }

    pub fn annual(mut self) -> Self {
        fn retain_annual(map: &mut HashMap<String, Concept>) {
            for concept in map.values_mut() {
                for facts in concept.units.values_mut() {
                    facts.sort_by_key(|x| Reverse(x.filed));

                    facts.retain(|x| {
                        let is_annual = x.fp.as_ref().is_some_and(|fp| fp == "FY");
                        let duration = x.end - x.start.unwrap_or(chrono::NaiveDate::MIN);
                        is_annual && duration.num_days() > 300
                    });

                    for fact in facts.iter_mut() {
                        fact.fy = Some(fact.end.year())
                    }

                    let mut seen = HashSet::new();
                    facts.retain(|u| {
                        let key = (u.start, u.end);
                        seen.insert(key)
                    });
                }
            }
        }

        retain_annual(&mut self.facts.dei);
        retain_annual(&mut self.facts.us_gaap);
        self
    }

    pub fn quarterly(mut self) -> Self {
        fn retain_quarterly(map: &mut HashMap<String, Concept>) {
            for concept in map.values_mut() {
                for facts in concept.units.values_mut() {
                    facts.sort_by_key(|x| Reverse(x.filed));

                    facts.retain(|x| {
                        let duration = x.end - x.start.unwrap_or(chrono::NaiveDate::MIN);
                        duration.num_days() < 100
                    });

                    for fact in facts.iter_mut() {
                        fact.fy = Some(fact.end.year());
                        if let Some(frame) = fact.frame.as_ref() {
                            match Regex::new(r"^CY(\d{4})(Q\d)$") {
                                Ok(regex) => {
                                    if let Some(caps) = regex.captures(frame) {
                                        match caps[1].parse::<i32>() {
                                            Ok(x) => fact.fy = Some(x),
                                            Err(_) => (),
                                        };
                                        fact.fp = Some(caps[2].to_string());
                                    }
                                }
                                Err(_) => (),
                            };
                        }
                    }

                    let mut seen = HashSet::new();
                    facts.retain(|u| {
                        let key = (u.start, u.end);
                        seen.insert(key)
                    });
                }
            }
        }

        retain_quarterly(&mut self.facts.dei);
        retain_quarterly(&mut self.facts.us_gaap);
        self
    }
}
