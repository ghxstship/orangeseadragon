"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common";
import {
  Globe,
  Languages,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useLanguageStore, SUPPORTED_LANGUAGES, useTranslation } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/i18n";

interface LanguageStatus {
  code: LanguageCode;
  status: "active" | "beta" | "coming_soon";
  completeness: number;
}

const languageStatuses: LanguageStatus[] = [
  { code: "en", status: "active", completeness: 100 },
  { code: "es", status: "active", completeness: 98 },
  { code: "fr", status: "active", completeness: 95 },
  { code: "de", status: "active", completeness: 92 },
  { code: "pt", status: "beta", completeness: 85 },
  { code: "zh", status: "beta", completeness: 78 },
  { code: "ja", status: "beta", completeness: 75 },
  { code: "ko", status: "coming_soon", completeness: 60 },
  { code: "ar", status: "coming_soon", completeness: 45 },
];

export default function LocalizationPage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: t("localization.active"), color: "bg-green-500" },
    beta: { label: t("localization.beta"), color: "bg-yellow-500" },
    coming_soon: { label: t("localization.comingSoon"), color: "bg-gray-500" },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("localization.title")}
        description={t("localization.description")}
        actions={<Button>{t("localization.saveChanges")}</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("localization.regionalSettings")}
            </CardTitle>
            <CardDescription>{t("localization.regionalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                {t("localization.primaryLanguage")}
              </Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("localization.timezone")}
              </Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t("localization.currency")}
              </Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("localization.dateFormat")}
              </Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("localization.formatPreferences")}</CardTitle>
            <CardDescription>{t("localization.formatDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("localization.use24Hour")}</Label>
                <p className="text-sm text-muted-foreground">{t("localization.use24HourDescription")}</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>{t("localization.weekStartsOn")}</Label>
                <p className="text-sm text-muted-foreground">{t("localization.weekStartsOnDescription")}</p>
              </div>
              <select className="p-2 border rounded-md bg-background">
                <option value="sunday">{t("days.sunday")}</option>
                <option value="monday">{t("days.monday")}</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>{t("localization.numberFormat")}</Label>
                <p className="text-sm text-muted-foreground">{t("localization.numberFormatDescription")}</p>
              </div>
              <select className="p-2 border rounded-md bg-background">
                <option value="1,234.56">1,234.56</option>
                <option value="1.234,56">1.234,56</option>
                <option value="1 234,56">1 234,56</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>{t("localization.measurementUnits")}</Label>
                <p className="text-sm text-muted-foreground">{t("localization.measurementUnitsDescription")}</p>
              </div>
              <select className="p-2 border rounded-md bg-background">
                <option value="imperial">{t("localization.imperial")}</option>
                <option value="metric">{t("localization.metric")}</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t("localization.availableLanguages")}
          </CardTitle>
          <CardDescription>{t("localization.availableLanguagesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const langStatus = languageStatuses.find((s) => s.code === lang.code);
              const status = statusConfig[langStatus?.status || "coming_soon"];
              const completeness = langStatus?.completeness || 0;
              const isCurrentLanguage = language === lang.code;

              return (
                <div
                  key={lang.code}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-primary ${
                    isCurrentLanguage ? "border-primary bg-accent/50" : ""
                  }`}
                  onClick={() => setLanguage(lang.code)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <h4 className="font-medium">{lang.name}</h4>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Code: {lang.code}</p>
                    </div>
                    {isCurrentLanguage && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{t("localization.translation")}</span>
                      <span>{completeness}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${completeness === 100 ? "bg-green-500" : completeness >= 90 ? "bg-blue-500" : "bg-yellow-500"}`}
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
