type ObservabilityLevel = "info" | "warn" | "error";

type ObservabilityContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
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
    context,
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
