"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { artistManagementPageConfig } from "@/config/pages/artist-management";
import { ARTIST_STATUS, CONTRACT_STATUS, type ArtistStatus, type ContractStatus } from "@/lib/enums";
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY } from "@/lib/config";

interface Artist {
  id: string;
  name: string;
  genre: string;
  event_name: string;
  stage: string;
  performance_date: string;
  performance_time: string;
  set_length: number;
  status: ArtistStatus;
  contract_status: ContractStatus;
  fee: number;
  deposit_paid: boolean;
  rider_submitted: boolean;
  stage_plot_submitted: boolean;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount, DEFAULT_CURRENCY);
}

export default function ArtistManagementPage() {
  const [artists, setArtists] = React.useState<Artist[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchArtists() {
      try {
        const response = await fetch("/api/v1/artist-management");
        if (response.ok) {
          const result = await response.json();
          setArtists(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  const stats = React.useMemo(() => {
    const totalFees = artists.reduce((acc, a) => acc + (a.fee || 0), 0);
    const confirmedArtists = artists.filter((a) => a.status === ARTIST_STATUS.CONFIRMED).length;
    const pendingContracts = artists.filter((a) => a.contract_status !== CONTRACT_STATUS.ACTIVE).length;

    return [
      { id: "total", label: "Total Artists", value: artists.length },
      { id: "confirmed", label: "Confirmed", value: confirmedArtists },
      { id: "totalFees", label: "Total Fees", value: formatCurrency(totalFees) },
      { id: "pendingContracts", label: "Pending Contracts", value: pendingContracts },
    ];
  }, [artists]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<Artist>
      config={artistManagementPageConfig}
      data={artists}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["name", "genre", "event_name", "stage"]}
      onAction={handleAction}
    />
  );
}
