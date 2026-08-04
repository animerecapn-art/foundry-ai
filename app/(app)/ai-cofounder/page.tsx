'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles, MessageSquare, Lightbulb, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Lightbulb,
    title: 'Idea Brainstorming',
    desc: 'Generate and refine startup ideas with AI-guided conversations',
  },
  {
    icon: TrendingUp,
    title: 'Market Research',
    desc: 'Deep-dive market analysis and competitor insights on demand',
  },
  {
    icon: MessageSquare,
    title: 'Strategic Advice',
    desc: 'Get founder-level strategic advice tailored to your idea',
  },
];

export default function AiCofounderPage() {
  return (
    <div className="space-y-8 pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Badge variant="info" className="mb-4">Beta Feature</Badge>
        <div className="w-20 h-20 rounded-3xl bg-brand-gradient mx-auto flex items-center justify-center shadow-glow mb-6">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">AI Co-Founder</h1>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
          Your always-available AI partner for brainstorming, strategy, and validation — trained on thousands of successful startup journeys.
        </p>
      </motion.div>

      {/* Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 p-8 text-center"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-muted-foreground bg-background/80 rounded-full px-2 py-1 backdrop-blur-sm">
          <Clock className="w-3 h-3" />
          Coming Q1 2025
        </div>
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
        <h2 className="font-display text-xl font-bold mb-2">We&apos;re building something special</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
          AI Co-Founder is in private beta. Join the waitlist to be among the first to experience your AI startup partner.
        </p>
        <Button variant="gradient" size="lg" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Join the Waitlist
        </Button>
        <p className="text-xs text-muted-foreground mt-3">342 founders already on the waitlist</p>
      </motion.div>

      {/* Feature Preview */}
      <div className="grid sm:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="p-5 text-center hover-lift">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mock Chat Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
            <div className="w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">AI Co-Founder</span>
            <span className="ml-auto text-xs text-muted-foreground">Preview</span>
          </div>
          <div className="p-4 space-y-4 opacity-60 pointer-events-none select-none">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-gradient flex-shrink-0 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 max-w-xs">
                <p className="text-sm">Hi! I&apos;ve analyzed your &quot;Legal Document Analyzer&quot; idea. The market timing looks excellent. Want to explore positioning strategies?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 max-w-xs">
                <p className="text-sm text-white">Yes, let&apos;s focus on small business positioning</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-gradient flex-shrink-0 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 max-w-xs">
                <p className="text-sm">Great choice. SMBs spend avg. $3,200/yr on legal review but 77% don&apos;t have regular access...</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <div className="flex-1 h-9 rounded-lg bg-muted/50 border border-input" />
              <Button variant="gradient" size="sm" disabled>Send</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
