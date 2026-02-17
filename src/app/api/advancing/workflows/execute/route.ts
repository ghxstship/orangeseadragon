import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, notFound, supabaseError } from '@/lib/api/response';
import { getErrorMessage } from '@/lib/api/error-message';

interface WorkflowStep {
  type: 'action' | 'condition' | 'wait' | 'branch';
  action?: string;
  config?: Record<string, unknown>;
}

interface StepResult {
  step: number;
  type: string;
  status: 'completed' | 'failed' | 'skipped';
  output?: Record<string, unknown>;
  error?: string;
  completed_at: string;
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  
  try {
    const body = await request.json();
    const { workflowId, entityType, entityId, triggerData } = body;
    
    if (!workflowId) {
      return badRequest('workflowId is required');
    }
    
    const userId = user.id;
    
    // Get the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('is_active', true)
      .single();
    
    if (workflowError || !workflow) {
      return notFound('Workflow not found or inactive');
    }
    
    // Check if already executed for this entity (if run_once_per_entity)
    if (workflow.run_once_per_entity && entityId) {
      const { data: existing } = await supabase
        .from('workflow_executions')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('entity_id', entityId)
        .eq('status', 'completed')
        .single();
      
      if (existing) {
        return badRequest('Workflow already executed for this entity');
      }
    }
    
    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        organization_id: workflow.organization_id,
        workflow_id: workflowId,
        entity_type: entityType || workflow.entity_type,
        entity_id: entityId,
        triggered_by: 'manual',
        trigger_data: triggerData || {},
        status: 'running',
        started_at: new Date().toISOString(),
        initiated_by: userId,
      })
      .select()
      .single();
    
    if (execError) {
      return supabaseError(execError);
    }
    
    // Execute workflow steps
    const steps = workflow.steps as WorkflowStep[];
    const stepResults: StepResult[] = [];
    let currentStep = 0;
    let shouldContinue = true;
    
    // Build context for step execution
    const context: Record<string, unknown> = {
      workflow,
      entity_type: entityType || workflow.entity_type,
      entity_id: entityId,
      trigger_data: triggerData || {},
      now: new Date().toISOString(),
    };
    
    // Load entity data if available
    if (entityId && entityType) {
      const tableName = getTableName(entityType);
      if (tableName) {
        const { data: entity } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', entityId)
          .single();
        
        if (entity) {
          context.entity = entity;
        }
      }
    }
    
    while (currentStep < steps.length && shouldContinue) {
      const step = steps[currentStep];
      if (!step) break;
      
      try {
        const result = await executeStep(supabase, step, context, workflow.organization_id);
        
        stepResults.push({
          step: currentStep,
          type: step.type,
          status: result.success ? 'completed' : 'failed',
          output: result.output,
          error: result.error,
          completed_at: new Date().toISOString(),
        });
        
        // Update context with step output
        if (result.output) {
          context[`step_${currentStep}_output`] = result.output;
        }
        
        // Handle conditions
        if (step.type === 'condition' && !result.success) {
          shouldContinue = false;
        }
        
        // Handle wait steps
        if (step.type === 'wait') {
          // Update execution to waiting status
          const { error: waitingStatusError } = await supabase
            .from('workflow_executions')
            .update({
              status: 'waiting',
              current_step: currentStep,
              step_results: stepResults,
            })
            .eq('id', execution.id);

          if (waitingStatusError) {
            return supabaseError(waitingStatusError);
          }
          
          return apiSuccess({
            executionId: execution.id,
            status: 'waiting',
            currentStep,
            waitingFor: step.config?.for,
          });
        }
        
        currentStep++;
      } catch (error) {
        stepResults.push({
          step: currentStep,
          type: step.type,
          status: 'failed',
          error: getErrorMessage(error, 'Unknown error'),
          completed_at: new Date().toISOString(),
        });
        
        shouldContinue = false;
      }
    }
    
    // Update execution with final status
    const finalStatus = stepResults.every(r => r.status !== 'failed') ? 'completed' : 'failed';
    
    const { error: finalStatusError } = await supabase
      .from('workflow_executions')
      .update({
        status: finalStatus,
        current_step: currentStep,
        step_results: stepResults,
        completed_at: new Date().toISOString(),
      })
      .eq('id', execution.id);

    if (finalStatusError) {
      return supabaseError(finalStatusError);
    }
    
    return apiCreated({
      executionId: execution.id,
      status: finalStatus,
      stepsExecuted: currentStep,
      stepResults,
    });
    
  } catch {
    return badRequest('Invalid request body');
  }
}

function getTableName(entityType: string): string | null {
  const tableMap: Record<string, string> = {
    'advance_item': 'advance_items',
    'production_advance': 'production_advances',
    'crew_member': 'crew_members',
    'crew_assignment': 'crew_assignments',
    'event': 'events',
  };
  return tableMap[entityType] || null;
}

async function executeStep(
  supabase: SupabaseClient,
  step: WorkflowStep,
  context: Record<string, unknown>,
  organizationId: string
): Promise<{ success: boolean; output?: Record<string, unknown>; error?: string }> {
  
  switch (step.type) {
    case 'condition':
      return executeCondition(step.config || {}, context);
    
    case 'action':
      return executeAction(supabase, step.action || '', step.config || {}, context, organizationId);
    
    case 'wait':
      return { success: true, output: { waiting: true, for: step.config?.for } };
    
    case 'branch':
      // Branch logic would be handled by the main loop
      return { success: true };
    
    default:
      return { success: false, error: `Unknown step type: ${step.type}` };
  }
}

function executeCondition(
  config: Record<string, unknown>,
  context: Record<string, unknown>
): { success: boolean; output?: Record<string, unknown>; error?: string } {
  const field = config.field as string;
  const operator = config.operator as string;
  const value = config.value;
  
  // Resolve field value from context
  const fieldValue = resolveValue(field, context);
  const compareValue = resolveValue(value, context);
  
  let result = false;
  
  switch (operator) {
    case 'eq':
      result = fieldValue === compareValue;
      break;
    case 'ne':
      result = fieldValue !== compareValue;
      break;
    case 'gt':
      result = Number(fieldValue) > Number(compareValue);
      break;
    case 'lt':
      result = Number(fieldValue) < Number(compareValue);
      break;
    case 'gte':
      result = Number(fieldValue) >= Number(compareValue);
      break;
    case 'lte':
      result = Number(fieldValue) <= Number(compareValue);
      break;
    case 'in':
      result = Array.isArray(compareValue) && compareValue.includes(fieldValue);
      break;
    case 'not_in':
      result = Array.isArray(compareValue) && !compareValue.includes(fieldValue);
      break;
    case 'contains':
      result = String(fieldValue).includes(String(compareValue));
      break;
    case 'starts_with':
      result = String(fieldValue).startsWith(String(compareValue));
      break;
    case 'not_empty':
      result = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
      break;
    default:
      return { success: false, error: `Unknown operator: ${operator}` };
  }
  
  return { success: result, output: { field, operator, fieldValue, compareValue, result } };
}

async function executeAction(
  supabase: SupabaseClient,
  action: string,
  config: Record<string, unknown>,
  context: Record<string, unknown>,
  organizationId: string
): Promise<{ success: boolean; output?: Record<string, unknown>; error?: string }> {
  
  switch (action) {
    case 'send_notification': {
      const template = config.template as string;
      const recipients = config.recipients as string[];
      
      // Resolve recipients
      const userIds: string[] = [];
      const entity = context.entity as Record<string, unknown> | undefined;
      
      for (const recipient of recipients) {
        if (recipient === 'assigned_to' && entity?.assigned_to) {
          userIds.push(entity.assigned_to as string);
        } else if (recipient === 'created_by' && entity?.created_by) {
          userIds.push(entity.created_by as string);
        } else if (recipient.match(/^[0-9a-f-]{36}$/)) {
          userIds.push(recipient);
        }
      }
      
      // Create notifications
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: 'workflow',
        title: `Workflow: ${template}`,
        message: `Automated notification from workflow`,
        data: {
          template,
          entity_type: context.entity_type,
          entity_id: context.entity_id,
        },
      }));
      
      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
      
      return { success: true, output: { notificationsSent: notifications.length } };
    }
    
    case 'update_field': {
      const field = config.field as string;
      const value = resolveValue(config.value, context);
      const entityId = context.entity_id as string;
      const entityType = context.entity_type as string;
      
      const tableName = getTableName(entityType);
      if (!tableName || !entityId) {
        return { success: false, error: 'Cannot update field: missing entity info' };
      }
      
      const { error } = await supabase
        .from(tableName)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', entityId);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, output: { field, value } };
    }
    
    case 'create_approval': {
      const title = config.title as string;
      const approvers = config.approvers as string[];
      const approvalRule = (config.approval_rule as string) || 'any';
      
      const { data, error } = await supabase
        .from('approval_requests')
        .insert({
          organization_id: organizationId,
          entity_type: context.entity_type as string,
          entity_id: context.entity_id as string,
          approval_type: 'workflow',
          title,
          requested_by: (context.trigger_data as Record<string, unknown>)?.user_id || null,
          approvers: approvers.map(a => ({ role: a })),
          approval_rule: approvalRule,
        })
        .select()
        .single();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, output: { approvalRequestId: data.id } };
    }
    
    default:
      return { success: false, error: `Unknown action: ${action}` };
  }
}

function resolveValue(value: unknown, context: Record<string, unknown>): unknown {
  if (typeof value !== 'string') return value;
  
  // Check for template syntax {{variable}}
  const templateMatch = value.match(/^\{\{(.+)\}\}$/);
  if (templateMatch) {
    const path = templateMatch[1] ?? '';
    return getNestedValue(context, path);
  }
  
  // Check for entity field reference
  if (value.startsWith('entity.')) {
    const field = value.substring(7);
    const entity = context.entity as Record<string, unknown> | undefined;
    return entity?.[field];
  }
  
  return value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    
    // Handle array access like [0]
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = (current as Record<string, unknown>)[key ?? ''];
      if (Array.isArray(current)) {
        current = current[parseInt(index ?? '0')];
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  
  return current;
}
