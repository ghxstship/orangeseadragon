"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { contactsPageConfig } from "@/config/pages/contacts";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company?: { name: string } | null;
  role: string;
  category: string;
  email: string;
  phone: string;
  location?: string;
  is_favorite: boolean;
  last_contacted?: string;
  tags: string[];
}

export default function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchContacts() {
      try {
        const response = await fetch("/api/v1/contacts");
        if (response.ok) {
          const result = await response.json();
          setContacts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const stats = React.useMemo(() => {
    const favorites = contacts.filter((c) => c.is_favorite).length;
    const vendors = contacts.filter((c) => c.category === "vendor").length;
    const artists = contacts.filter((c) => c.category === "artist").length;
    return [
      { id: "total", label: "Total Contacts", value: contacts.length },
      { id: "favorites", label: "Favorites", value: favorites },
      { id: "vendors", label: "Vendors", value: vendors },
      { id: "artists", label: "Artists", value: artists },
    ];
  }, [contacts]);

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
    <DataViewPage<Contact>
      config={contactsPageConfig}
      data={contacts}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["first_name", "last_name", "email"]}
      onAction={handleAction}
    />
  );
}
