"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Type,
  Layout,
  Layers,
  Save,
  RotateCcw,
  Eye,
  Upload,
  Sun,
  Moon,
} from "lucide-react";
import {
  type WhiteLabelTheme,
  whiteLabelDefaultTheme as defaultTheme,
  themePresets,
  applyTheme,
} from "@/lib/theming";

type BorderRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
type ButtonStyle = "default" | "rounded" | "pill";
type CardStyle = "flat" | "elevated" | "bordered";
type InputStyle = "default" | "filled" | "underlined";
type Density = "compact" | "comfortable" | "spacious";

export default function BrandingSettingsPage() {
  const [theme, setTheme] = React.useState<WhiteLabelTheme>(() => defaultTheme);
  const [previewMode, setPreviewMode] = React.useState<"light" | "dark">("light");
  const [hasChanges, setHasChanges] = React.useState(false);

  const updateTheme = <K extends keyof WhiteLabelTheme>(
    key: K,
    value: WhiteLabelTheme[K]
  ) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateBrand = (key: keyof WhiteLabelTheme["brand"], value: string) => {
    setTheme((prev) => ({
      ...prev,
      brand: { ...prev.brand, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateTypography = (
    key: keyof WhiteLabelTheme["typography"],
    value: string | number
  ) => {
    setTheme((prev) => ({
      ...prev,
      typography: { ...prev.typography, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateComponents = (
    key: keyof WhiteLabelTheme["components"],
    value: string
  ) => {
    setTheme((prev) => ({
      ...prev,
      components: { ...prev.components, [key]: value },
    }));
    setHasChanges(true);
  };

  const updateLayout = (
    key: keyof WhiteLabelTheme["layout"],
    value: number | string
  ) => {
    setTheme((prev) => ({
      ...prev,
      layout: { ...prev.layout, [key]: value },
    }));
    setHasChanges(true);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = themePresets.find((p) => p.id === presetId);
    if (preset && preset.theme.brand) {
      setTheme((prev) => ({
        ...prev,
        brand: {
          ...prev.brand,
          primaryColor: preset.preview.primary,
          secondaryColor: preset.preview.secondary,
          accentColor: preset.preview.accent,
        },
      }));
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    applyTheme(theme, previewMode);
    setHasChanges(false);
  };

  const handleReset = () => {
    setTheme(() => defaultTheme);
    setHasChanges(false);
  };

  const handlePreview = () => {
    applyTheme(theme, previewMode);
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branding & Theme</h1>
          <p className="text-muted-foreground mt-1">
            Customize your organization&apos;s look and feel
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="mr-2">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="brand" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Brand
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Typography
              </TabsTrigger>
              <TabsTrigger value="components" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Components
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brand" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Define your primary brand colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={theme.brand.primaryColor}
                          onChange={(e) => updateBrand("primaryColor", e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={theme.brand.primaryColor}
                          onChange={(e) => updateBrand("primaryColor", e.target.value)}
                          placeholder="#0066FF"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={theme.brand.secondaryColor}
                          onChange={(e) => updateBrand("secondaryColor", e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={theme.brand.secondaryColor}
                          onChange={(e) => updateBrand("secondaryColor", e.target.value)}
                          placeholder="#6B7280"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={theme.brand.accentColor || "#10B981"}
                          onChange={(e) => updateBrand("accentColor", e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={theme.brand.accentColor || ""}
                          onChange={(e) => updateBrand("accentColor", e.target.value)}
                          placeholder="#10B981"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Quick Presets</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {themePresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset.id)}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors"
                        >
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: preset.preview.primary }}
                          />
                          <span className="text-xs font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Brand Assets</CardTitle>
                  <CardDescription>
                    Upload your logo and favicon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      value={theme.brand.appName || ""}
                      onChange={(e) => updateBrand("appName", e.target.value)}
                      placeholder="Your App Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Logo (Light Mode)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          SVG, PNG or JPG (max. 2MB)
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo (Dark Mode)</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          SVG, PNG or JPG (max. 2MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer max-w-[200px]">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">
                        32x32 PNG or ICO
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Font Settings</CardTitle>
                  <CardDescription>
                    Customize typography for your brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Primary Font Family</Label>
                    <Select
                      value={theme.typography.fontFamily}
                      onValueChange={(v) => updateTypography("fontFamily", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                        <SelectItem value="Roboto, system-ui, sans-serif">Roboto</SelectItem>
                        <SelectItem value="Open Sans, system-ui, sans-serif">Open Sans</SelectItem>
                        <SelectItem value="Lato, system-ui, sans-serif">Lato</SelectItem>
                        <SelectItem value="Poppins, system-ui, sans-serif">Poppins</SelectItem>
                        <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headingFontFamily">Heading Font Family</Label>
                    <Select
                      value={theme.typography.headingFontFamily || theme.typography.fontFamily}
                      onValueChange={(v) => updateTypography("headingFontFamily", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                        <SelectItem value="Roboto, system-ui, sans-serif">Roboto</SelectItem>
                        <SelectItem value="Montserrat, system-ui, sans-serif">Montserrat</SelectItem>
                        <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                        <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Base Font Size</Label>
                      <span className="text-sm text-muted-foreground">
                        {theme.typography.baseFontSize || 14}px
                      </span>
                    </div>
                    <Slider
                      value={[theme.typography.baseFontSize || 14]}
                      onValueChange={([v]) => updateTypography("baseFontSize", v)}
                      min={12}
                      max={18}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Component Styles</CardTitle>
                  <CardDescription>
                    Customize the appearance of UI components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <Select
                      value={theme.components.borderRadius}
                      onValueChange={(v) => updateComponents("borderRadius", v as BorderRadius)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (0px)</SelectItem>
                        <SelectItem value="sm">Small (2px)</SelectItem>
                        <SelectItem value="md">Medium (6px)</SelectItem>
                        <SelectItem value="lg">Large (8px)</SelectItem>
                        <SelectItem value="xl">Extra Large (12px)</SelectItem>
                        <SelectItem value="full">Full (9999px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Button Style</Label>
                    <Select
                      value={theme.components.buttonStyle}
                      onValueChange={(v) => updateComponents("buttonStyle", v as ButtonStyle)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="pill">Pill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Card Style</Label>
                    <Select
                      value={theme.components.cardStyle}
                      onValueChange={(v) => updateComponents("cardStyle", v as CardStyle)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="elevated">Elevated (Shadow)</SelectItem>
                        <SelectItem value="bordered">Bordered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Input Style</Label>
                    <Select
                      value={theme.components.inputStyle}
                      onValueChange={(v) => updateComponents("inputStyle", v as InputStyle)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="underlined">Underlined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Settings</CardTitle>
                  <CardDescription>
                    Configure layout dimensions and density
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Sidebar Width</Label>
                      <span className="text-sm text-muted-foreground">
                        {theme.layout.sidebarWidth}px
                      </span>
                    </div>
                    <Slider
                      value={[theme.layout.sidebarWidth]}
                      onValueChange={([v]) => updateLayout("sidebarWidth", v)}
                      min={200}
                      max={320}
                      step={8}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Header Height</Label>
                      <span className="text-sm text-muted-foreground">
                        {theme.layout.headerHeight}px
                      </span>
                    </div>
                    <Slider
                      value={[theme.layout.headerHeight]}
                      onValueChange={([v]) => updateLayout("headerHeight", v)}
                      min={48}
                      max={80}
                      step={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content Density</Label>
                    <Select
                      value={theme.layout.density}
                      onValueChange={(v) => updateLayout("density", v as Density)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                  <CardDescription>
                    Add custom CSS for advanced customization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={theme.customCss || ""}
                    onChange={(e) => updateTheme("customCss", e.target.value)}
                    placeholder="/* Add your custom CSS here */&#10;.my-custom-class {&#10;  color: var(--primary);&#10;}"
                    className="font-mono text-sm min-h-[200px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === "light" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewMode("light")}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === "dark" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewMode("dark")}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`rounded-lg border p-4 space-y-4 ${
                  previewMode === "dark" ? "bg-slate-900 text-white" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: theme.brand.primaryColor }}
                  >
                    {(theme.brand.appName || "A")[0]}
                  </div>
                  <span
                    className="font-semibold"
                    style={{ fontFamily: theme.typography.fontFamily }}
                  >
                    {theme.brand.appName || "Your App"}
                  </span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3
                    className="font-semibold"
                    style={{ fontFamily: theme.typography.headingFontFamily }}
                  >
                    Sample Heading
                  </h3>
                  <p
                    className="text-sm opacity-70"
                    style={{
                      fontFamily: theme.typography.fontFamily,
                      fontSize: theme.typography.baseFontSize,
                    }}
                  >
                    This is sample body text to preview your typography settings.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 text-sm font-medium text-white"
                    style={{
                      backgroundColor: theme.brand.primaryColor,
                      borderRadius:
                        theme.components.borderRadius === "full"
                          ? "9999px"
                          : theme.components.borderRadius === "xl"
                          ? "12px"
                          : theme.components.borderRadius === "lg"
                          ? "8px"
                          : theme.components.borderRadius === "md"
                          ? "6px"
                          : theme.components.borderRadius === "sm"
                          ? "2px"
                          : "0px",
                    }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium"
                    style={{
                      backgroundColor: theme.brand.secondaryColor,
                      color: "white",
                      borderRadius:
                        theme.components.borderRadius === "full"
                          ? "9999px"
                          : theme.components.borderRadius === "xl"
                          ? "12px"
                          : theme.components.borderRadius === "lg"
                          ? "8px"
                          : theme.components.borderRadius === "md"
                          ? "6px"
                          : theme.components.borderRadius === "sm"
                          ? "2px"
                          : "0px",
                    }}
                  >
                    Secondary
                  </button>
                </div>

                <div
                  className="p-3 border"
                  style={{
                    borderRadius:
                      theme.components.borderRadius === "full"
                        ? "12px"
                        : theme.components.borderRadius === "xl"
                        ? "12px"
                        : theme.components.borderRadius === "lg"
                        ? "8px"
                        : theme.components.borderRadius === "md"
                        ? "6px"
                        : theme.components.borderRadius === "sm"
                        ? "2px"
                        : "0px",
                    boxShadow:
                      theme.components.cardStyle === "elevated"
                        ? "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        : "none",
                  }}
                >
                  <p className="text-sm font-medium">Sample Card</p>
                  <p className="text-xs opacity-60 mt-1">
                    Card with {theme.components.cardStyle} style
                  </p>
                </div>

                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.brand.primaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.brand.secondaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.brand.accentColor || "#10B981" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
