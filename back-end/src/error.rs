use axum::{http::StatusCode, response::IntoResponse};

pub enum AppError {
    AnyhowError(anyhow::Error),
    ProblemDetails(problem_details::ProblemDetails),
}

impl From<anyhow::Error> for AppError {
    fn from(value: anyhow::Error) -> Self {
        Self::AnyhowError(value)
    }
}

impl From<problem_details::ProblemDetails> for AppError {
    fn from(value: problem_details::ProblemDetails) -> Self {
        Self::ProblemDetails(value)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            AppError::AnyhowError(err) => {
                let details = problem_details::ProblemDetails::from_status_code(
                    StatusCode::INTERNAL_SERVER_ERROR,
                )
                .with_title("Internal Server Error")
                .with_detail(err.to_string());
                details.into_response()
            }
            AppError::ProblemDetails(err) => err.into_response(),
        }
    }
}

pub type AppResult<T> = Result<T, AppError>;
