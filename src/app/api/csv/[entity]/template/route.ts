import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { badRequest, notFound } from '@/lib/api/response';
import { resolveEntityContext } from '@/lib/api/entity-access';
import { deriveModelConfig } from '@/lib/csv/registry';
import { generateTemplateString, generateTemplateFilename } from '@/lib/csv/template';

/**
 * CSV TEMPLATE DOWNLOAD
 *
 * GET /api/csv/[entity]/template
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;
  const ctx = resolveEntityContext(entity);
  if (!ctx) return notFound('Entity');

  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;

  const csvConfig = deriveModelConfig(ctx.schema);

  if (!csvConfig.importEnabled) {
    return badRequest('Import is not enabled for this entity');
  }

  const csv = generateTemplateString(csvConfig);
  const filename = generateTemplateFilename(csvConfig.displayName);
  const bom = '\uFEFF';

  return new Response(bom + csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
