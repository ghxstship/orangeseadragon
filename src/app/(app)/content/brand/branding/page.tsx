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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common";
import {
  Palette,
  Image,
  Type,
  Upload,
  Download,
  Eye,
} from "lucide-react";

export default function BrandingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding"
        description="Customize your organization's branding"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button>Save Changes</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-5 w-5" />
              Logo
            </CardTitle>
            <CardDescription>Upload your organization logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Logo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-muted-foreground">LOGO</span>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, SVG or JPG. Recommended: 512x512px
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-muted-foreground">F</span>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Favicon
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  ICO or PNG. 32x32px or 64x64px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colors
            </CardTitle>
            <CardDescription>Define your brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary border"></div>
                <Input defaultValue="#6366f1" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary border"></div>
                <Input defaultValue="#f1f5f9" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500 border"></div>
                <Input defaultValue="#3b82f6" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Success Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-500 border"></div>
                <Input defaultValue="#22c55e" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Warning Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 border"></div>
                <Input defaultValue="#eab308" className="font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Error Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-500 border"></div>
                <Input defaultValue="#ef4444" className="font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
            <CardDescription>Configure fonts and text styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="inter">Inter</option>
                <option value="roboto">Roboto</option>
                <option value="opensans">Open Sans</option>
                <option value="lato">Lato</option>
                <option value="montserrat">Montserrat</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="inter">Inter</option>
                <option value="roboto">Roboto</option>
                <option value="opensans">Open Sans</option>
                <option value="lato">Lato</option>
                <option value="sourcesans">Source Sans Pro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Base Font Size</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="14">14px</option>
                <option value="16">16px (Default)</option>
                <option value="18">18px</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Information displayed in communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input defaultValue="ATLVS Productions" />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input defaultValue="Unified Event Operations Platform" />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input type="email" defaultValue="support@atlvs.com" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input type="url" defaultValue="https://atlvs.com" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Customize email appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-lg p-4 text-center">
                <div className="h-32 bg-muted rounded mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground">Header Preview</span>
                </div>
                <p className="font-medium">Email Header</p>
                <Button variant="outline" size="sm" className="mt-2">Customize</Button>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="h-32 bg-muted rounded mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground">Footer Preview</span>
                </div>
                <p className="font-medium">Email Footer</p>
                <Button variant="outline" size="sm" className="mt-2">Customize</Button>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="h-32 bg-muted rounded mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground">Signature Preview</span>
                </div>
                <p className="font-medium">Email Signature</p>
                <Button variant="outline" size="sm" className="mt-2">Customize</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>Download brand assets for external use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                Logo Pack
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                Color Palette
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                Font Files
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Download className="h-6 w-6 mb-2" />
                Brand Guidelines
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
