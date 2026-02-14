import { NextRequest } from "next/server";
import { apiNoContent, badRequest } from "@/lib/api/response";
import { captureError, logWarn, extractRequestContext } from "@/lib/observability";

export async function POST(request: NextRequest) {
  const requestContext = extractRequestContext(request.headers);

  try {
    const body = await request.json();
    const report = body?.["csp-report"] || body?.report || body;

    if (!report || typeof report !== "object") {
      return badRequest("Invalid CSP report payload");
    }

    logWarn("security.csp_violation", {
      ...requestContext,
      report,
      endpoint: request.nextUrl.pathname,
      user_agent: request.headers.get("user-agent") || undefined,
    });

    return apiNoContent();
  } catch (error) {
    captureError(error, "security.csp_report_parse_failed", {
      ...requestContext,
      endpoint: request.nextUrl.pathname,
    });
    return badRequest("Invalid CSP report payload");
  }
}
