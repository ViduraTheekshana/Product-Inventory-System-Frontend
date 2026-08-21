// Matches your backend's ProblemDetail shape - this is what
// GlobalExceptionHandler actually sends back on any failure.
export interface ApiError {
  title: string;
  status: number;
  detail: string;
}