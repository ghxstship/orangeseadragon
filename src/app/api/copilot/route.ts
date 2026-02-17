import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest } from '@/lib/api/response';
import { generateCopilotResponse, generateProactiveSuggestions } from '@/lib/services/copilot-service';
import type { CopilotMessage, CopilotContext } from '@/lib/services/copilot-service';
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();
    const { messages, context, maxTokens, temperature } = body as {
      messages: CopilotMessage[];
      context: CopilotContext;
      maxTokens?: number;
      temperature?: number;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return badRequest('messages array is required');
    }

    const enrichedContext: CopilotContext = {
      ...context,
      userId: user.id,
    };

    const response = await generateCopilotResponse({
      messages,
      context: enrichedContext,
      maxTokens,
      temperature,
    });

    return apiSuccess(response);
  } catch (error) {
    captureError(error, 'copilot.api.error');
    return badRequest('Failed to generate response');
  }
}

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;

  const searchParams = request.nextUrl.searchParams;
  const contextModule = searchParams.get('module') || undefined;
  const entityType = searchParams.get('entityType') || undefined;
  const entityId = searchParams.get('entityId') || undefined;

  const suggestions = generateProactiveSuggestions({
    module: contextModule,
    entityType,
    entityId,
  });

  return apiSuccess({ suggestions });
}
