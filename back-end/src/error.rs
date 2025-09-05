use axum::{http::StatusCode, response::IntoResponse};

pub enum AppError {
    AnyhowError(anyhow::Error),
    ProblemDetails(problem_details::ProblemDetails),
    SecError(sec::Error),
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

impl From<sec::Error> for AppError {
    fn from(value: sec::Error) -> Self {
        Self::SecError(value)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            AppError::AnyhowError(err) => {
                let details = problem_details::ProblemDetails::from_status_code(
                    StatusCode::INTERNAL_SERVER_ERROR,
                )
                .with_title(err.to_string())
                .with_detail(
                    err.source()
                        .map(|x| x.to_string())
                        .unwrap_or("N/A".to_owned()),
                );
                details.into_response()
            }
            AppError::ProblemDetails(err) => err.into_response(),
            AppError::SecError(err) => {
                let details = problem_details::ProblemDetails::from_status_code(
                    StatusCode::INTERNAL_SERVER_ERROR,
                )
                .with_title(err.to_string());
                details.into_response()
            }
        }
    }
}

pub type AppResult<T> = Result<T, AppError>;
