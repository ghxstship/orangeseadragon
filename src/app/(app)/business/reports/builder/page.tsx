"use client";

import * as React from "react";
import { BuilderPage } from "@/components/common";
import { reportsBuilderPageConfig } from "@/config/pages/reports-builder";

export default function ReportsBuilderPage() {
  const handleSave = React.useCallback((value: unknown) => {
    console.log("Save report:", value);
  }, []);

  const handleRun = React.useCallback(() => {
    console.log("Preview report");
  }, []);

  const handleExport = React.useCallback((format: string) => {
    console.log("Export report as:", format);
  }, []);

  return (
    <BuilderPage
      config={reportsBuilderPageConfig}
      onSave={handleSave}
      onRun={handleRun}
      onExport={handleExport}
    />
  );
}
