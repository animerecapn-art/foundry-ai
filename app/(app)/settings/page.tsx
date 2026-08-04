'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, CreditCard, Palette, Shield, ChevronRight, Save,
  Moon, Sun, Monitor, Check
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { mockUser } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const notifSettings = [
  { label: 'Reality check complete', desc: 'When an AI analysis finishes', defaultOn: true },
  { label: 'Weekly digest', desc: 'Weekly summary of your portfolio', defaultOn: true },
  { label: 'Idea milestone', desc: 'When an idea reaches a new stage', defaultOn: true },
  { label: 'Community replies', desc: 'Replies to your community posts', defaultOn: false },
  { label: 'Product updates', desc: 'New features and improvements', defaultOn: false },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account, preferences, and billing
        </p>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="w-3.5 h-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="w-3.5 h-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Billing
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your name, email, and avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback className="text-xl">
                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change avatar</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input defaultValue={mockUser.name} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" defaultValue={mockUser.email} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Bio</label>
                <Input placeholder="Serial entrepreneur | Building in public" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Website</label>
                <Input placeholder="https://yourwebsite.com" />
              </div>
              <Button variant="gradient" onClick={handleSave} className="gap-2">
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save changes</>}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all ideas</p>
                </div>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {notifSettings.map((setting, i) => {
                const [enabled, setEnabled] = useState(setting.defaultOn);
                return (
                  <div key={setting.label} className={cn('flex items-center justify-between py-4', i > 0 && 'border-t border-border/50')}>
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => setEnabled(!enabled)}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                        enabled ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                          enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        )}
                        style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }}
                      />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="mt-6 space-y-4">
          <Card className="overflow-hidden">
            <div className="h-1 bg-brand-gradient" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold">Pro Plan</h3>
                    <Badge variant="default">Current</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">$19/month · Renews January 1, 2025</p>
                  <ul className="mt-3 space-y-1.5">
                    {['Unlimited AI reality checks', 'Unlimited reports', 'Priority support', 'Early access features'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" size="sm">Manage Plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 rounded bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>Choose how FoundryAI looks on your screen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                      theme === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    {theme === option.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <option.icon className={cn('w-6 h-6', theme === option.value ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
