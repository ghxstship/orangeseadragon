export function extractApiErrorMessage(errorPayload: unknown, fallbackMessage: string): string {
  if (!errorPayload || typeof errorPayload !== 'object') {
    return fallbackMessage;
  }

  const payload = errorPayload as {
    message?: unknown;
    error?: unknown;
    code?: unknown;
  };

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  if (payload.error && typeof payload.error === 'object') {
    const nestedError = payload.error as { message?: unknown };
    if (typeof nestedError.message === 'string' && nestedError.message.trim()) {
      return nestedError.message;
    }
  }

  if (typeof payload.code === 'string' && payload.code === 'UNAUTHORIZED') {
    return 'Authentication required';
  }

  return fallbackMessage;
}

export async function parseApiErrorResponse(response: Response, fallbackMessage: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : { message: await response.text().catch(() => '') };

  return extractApiErrorMessage(payload, fallbackMessage);
}

export async function throwApiErrorResponse(response: Response, fallbackMessage: string): Promise<never> {
  throw new Error(await parseApiErrorResponse(response, fallbackMessage));
}
