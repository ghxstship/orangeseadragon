type ObservabilityLevel = "info" | "warn" | "error";

type ObservabilityContext = Record<string, unknown>;

type HeaderLike =
  | Headers
  | {
      get(name: string): string | null;
    }
  | Record<string, string | undefined>;

const OBSERVABILITY_SERVICE_NAME = "atlvs-web";

function normalizeContext(context: ObservabilityContext): ObservabilityContext {
  const requestId = context.request_id ?? context.requestId;
  const correlationId = context.correlation_id ?? context.correlationId;

  return {
    ...context,
    ...(requestId ? { request_id: requestId } : {}),
    ...(correlationId ? { correlation_id: correlationId } : {}),
  };
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.cause ? { cause: String(error.cause) } : {}),
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error",
  };
}

function emit(level: ObservabilityLevel, event: string, context: ObservabilityContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: OBSERVABILITY_SERVICE_NAME,
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "0.0.0",
    context: normalizeContext(context),
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.info(serialized);
  }
}

export function logInfo(event: string, context: ObservabilityContext = {}) {
  emit("info", event, context);
}

export function logWarn(event: string, context: ObservabilityContext = {}) {
  emit("warn", event, context);
}

export function captureError(error: unknown, event: string, context: ObservabilityContext = {}) {
  emit("error", event, {
    ...context,
    error: serializeError(error),
  });
}

export function extractRequestContext(headers: HeaderLike): Pick<ObservabilityContext, "request_id" | "correlation_id"> {
  const getHeader = (name: string): string | null => {
    if (headers instanceof Headers || typeof (headers as { get?: unknown }).get === "function") {
      return (headers as { get(name: string): string | null }).get(name);
    }
    const recordHeaders = headers as Record<string, string | undefined>;
    return recordHeaders[name] ?? recordHeaders[name.toLowerCase()] ?? null;
  };

  return {
    request_id: getHeader("x-request-id") || "unknown",
    correlation_id: getHeader("x-correlation-id") || "unknown",
  };
}
