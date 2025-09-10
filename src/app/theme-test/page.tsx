"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Shalean Cleaning Services</h1>
          <h2 className="text-2xl text-muted-foreground">Theme Test Page</h2>
          <p className="text-lg text-muted-foreground">
            Testing our custom brand colors and components
          </p>
        </div>

        {/* Color Palette Display */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Color Palette</CardTitle>
            <CardDescription>Our custom Shalean Cleaning Services color scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Primary Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Primary Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-primary"></div>
                    <span className="text-sm text-foreground">Primary Blue (#1E88E5)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-secondary"></div>
                    <span className="text-sm text-foreground">Secondary Blue (#E3F2FD)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-accent"></div>
                    <span className="text-sm text-foreground">Accent Green (#AEEA00)</span>
                  </div>
                </div>
              </div>

              {/* Neutral Colors */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Neutral Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-background border border-border"></div>
                    <span className="text-sm text-foreground">Background (#FFFFFF)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-foreground"></div>
                    <span className="text-sm text-foreground">Foreground (#212121)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-muted"></div>
                    <span className="text-sm text-foreground">Muted (#F0F0F0)</span>
                  </div>
                </div>
              </div>

              {/* Brand Color Variations */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Brand Variations</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-brand-blue-500"></div>
                    <span className="text-sm text-foreground">Brand Blue 500</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-brand-green-500"></div>
                    <span className="text-sm text-foreground">Brand Green 500</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-brand-neutral-600"></div>
                    <span className="text-sm text-foreground">Brand Neutral 600</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
              <CardDescription>Different button variants using our theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Button Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="destructive">Destructive Button</Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Button Sizes</h4>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Button States</h4>
                <div className="flex flex-wrap gap-2">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="bg-accent hover:bg-accent/90">Custom Accent</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields and labels with our theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter your phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" type="text" placeholder="This input is disabled" disabled />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards with Different Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Primary Card</CardTitle>
              <CardDescription>This card uses primary background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Perfect for call-to-action sections and important information.</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardHeader>
              <CardTitle>Secondary Card</CardTitle>
              <CardDescription>This card uses secondary background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Great for highlighting content without being too prominent.</p>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground">
            <CardHeader>
              <CardTitle>Accent Card</CardTitle>
              <CardDescription>This card uses accent background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Perfect for success messages and positive actions.</p>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Test */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Test</CardTitle>
            <CardDescription>Testing color contrast and readability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Normal Text</h3>
              <p className="text-foreground">
                This is normal text in our primary foreground color. It should have excellent contrast
                against the white background for optimal readability.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">Muted Text</h3>
              <p className="text-muted-foreground">
                This is muted text for secondary information. It should still be readable but less
                prominent than the primary text.
              </p>
            </div>
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              <h3 className="text-lg font-semibold">Primary Background Text</h3>
              <p>
                This text is on a primary background. The white text should have excellent contrast
                against the blue background.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
