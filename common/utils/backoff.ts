export function backoff(attempt: number, ms = 1000) {
  return ms * Math.pow(2, attempt - 1)
}
