'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CrudList } from '@/lib/crud/components/CrudList';
import { productionAdvanceSchema } from '@/lib/schemas/advancing';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DynamicForm } from '@/lib/crud/components/DynamicForm';

export default function AdvancesPage() {
  const router = useRouter();
  const [intakeOpen, setIntakeOpen] = useState(false);

  return (
    <>
      <CrudList schema={productionAdvanceSchema} />

      {/* Floating action button for Create/Submit */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="lg" className="shadow-lg" onClick={() => setIntakeOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Create / Submit Advance
        </Button>
      </div>

      <Dialog open={intakeOpen} onOpenChange={setIntakeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Advance Request</DialogTitle>
            <DialogDescription>
              Submit a new production advance. Items will be sourced from the Assets catalog.
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            schema={productionAdvanceSchema}
            mode="create"
            onSubmit={async (values) => {
              try {
                const res = await fetch('/api/advancing/advances', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(values),
                });
                if (res.ok) {
                  setIntakeOpen(false);
                  router.refresh();
                }
              } catch (error) {
                console.error('Failed to create advance:', error);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
