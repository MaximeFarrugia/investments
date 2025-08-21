use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Pagination {
    pub offset: u64,
    pub limit: i64,
}

#[derive(Serialize)]
pub struct PaginationData {
    pub total_count: i64,
    pub offset: u64,
    pub limit: i64,
    pub has_next: bool,
    pub has_prev: bool,
}