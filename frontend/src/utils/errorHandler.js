/**
 * Format API error for display in toast messages
 * Handles various error formats from FastAPI including validation errors
 */
export function formatApiError(error, defaultMessage = 'Une erreur est survenue') {
  // If no error response, return default
  if (!error.response?.data?.detail) {
    return defaultMessage;
  }

  const detail = error.response.data.detail;

  // If detail is an array of validation errors (FastAPI validation)
  if (Array.isArray(detail)) {
    return detail.map(err => {
      if (typeof err === 'object' && err.msg) {
        return err.msg;
      }
      return JSON.stringify(err);
    }).join(', ');
  }

  // If detail is a string
  if (typeof detail === 'string') {
    return detail;
  }

  // If detail is an object with msg property
  if (typeof detail === 'object' && detail.msg) {
    return detail.msg;
  }

  // If detail is an object, try to stringify it
  if (typeof detail === 'object') {
    try {
      return JSON.stringify(detail);
    } catch (e) {
      return defaultMessage;
    }
  }

  return defaultMessage;
}
