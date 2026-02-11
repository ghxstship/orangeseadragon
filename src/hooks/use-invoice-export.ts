"use client";

import { useState, useCallback } from "react";

interface ExportOptions {
  includeTimesheet?: boolean;
}

export function useInvoiceExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsPdf = useCallback(
    async (invoiceId: string, options: ExportOptions = {}) => {
      setIsExporting(true);
      try {
        const params = new URLSearchParams();
        if (options.includeTimesheet) params.set("include_timesheet", "true");

        const response = await fetch(
          `/api/invoices/${invoiceId}/export?${params.toString()}`
        );
        if (!response.ok) throw new Error("Export failed");

        const result = await response.json();
        const html = result.data?.content;
        if (!html) throw new Error("No content returned");

        // Open in a new window for print-to-PDF
        const printWindow = window.open("", "_blank", "width=800,height=1100");
        if (!printWindow) throw new Error("Popup blocked");

        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to render, then trigger print
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };

        // Fallback: trigger print after a short delay if onload doesn't fire
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch {
            // Window may have been closed
          }
        }, 500);

        return { success: true, filename: result.data?.filename };
      } catch (error) {
        console.error("[Invoice Export] PDF generation failed:", error);
        return { success: false, error };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportAsHtml = useCallback(
    async (invoiceId: string, options: ExportOptions = {}) => {
      setIsExporting(true);
      try {
        const params = new URLSearchParams();
        if (options.includeTimesheet) params.set("include_timesheet", "true");

        const response = await fetch(
          `/api/invoices/${invoiceId}/export?${params.toString()}`
        );
        if (!response.ok) throw new Error("Export failed");

        const result = await response.json();
        const html = result.data?.content;
        const filename = result.data?.filename || `invoice_${invoiceId}.html`;

        // Download as HTML file
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, filename };
      } catch (error) {
        console.error("[Invoice Export] HTML download failed:", error);
        return { success: false, error };
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return { exportAsPdf, exportAsHtml, isExporting };
}
