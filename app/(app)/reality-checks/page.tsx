'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Brain, DollarSign, Globe, Building,
  Layers, FileText, AlertCircle, ArrowRight, Loader2,
  Lightbulb, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const LOADING_MESSAGES = [
  'Understanding your idea...',
  'Researching competitors...',
  'Checking market demand...',
  'Looking for weaknesses...',
  'Building your report...',
  'Finalizing Reality Score...',
];

const INDUSTRIES = [
  'SaaS', 'Marketplace', 'Consumer App', 'Fintech', 'HealthTech',
  'EdTech', 'E-commerce', 'Developer Tools', 'AI/ML', 'Other',
];

const STAGES = [
  { value: 'concept', label: 'Concept / Idea' },
  { value: 'validation', label: 'Problem Validation' },
  { value: 'mvp', label: 'Minimum Viable Product (MVP)' },
  { value: 'growth', label: 'Early Growth / Traction' },
  { value: 'scale', label: 'Scaling' },
];

export default function NewRealityCheckPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    oneLinePitch: '',
    problem: '',
    solution: '',
    targetAudience: '',
    businessModel: '',
    country: 'United States',
    category: 'SaaS',
    stage: 'concept',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Rotating loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Startup Name is required');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/reality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze startup idea');
      }

      // Success - Redirect to report page
      router.push(`/reports/${data.checkId}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] pb-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] py-12 text-center"
          >
            <div className="relative mb-8">
              {/* Pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              />
              <div className="relative z-10 w-24 h-24 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <Brain className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>

            <div className="h-16 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="font-display text-xl font-bold text-foreground"
                >
                  {LOADING_MESSAGES[loadingStep]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-muted-foreground mt-2">
                This usually takes about 10-15 seconds. Please do not close this page.
              </p>
            </div>

            <div className="w-64 max-w-xs mt-6 bg-muted h-1 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 15, ease: 'easeOut' }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form-screen"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="info" className="gap-1 px-2.5 py-0.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI reality check
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-bold">New Reality Check</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Fill in your startup concept. Our AI will perform immediate competitor mapping, financial validation, and SWOT analysis.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="border border-border/80 shadow-md">
                <CardContent className="p-6 space-y-5">
                  {/* Basic Info Row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        Startup Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. LegalEase AI"
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        One-line Pitch
                      </label>
                      <Input
                        name="oneLinePitch"
                        value={formData.oneLinePitch}
                        onChange={handleChange}
                        placeholder="e.g. AI-powered contracts for freelance designers"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Industry & Stage & Country */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-muted-foreground" /> Industry
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-muted-foreground" /> Stage
                      </label>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleChange}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {STAGES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-muted-foreground" /> Country / Target Market
                      </label>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="e.g. United States, India, Global"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Problem & Solution */}
                  <div className="space-y-4 pt-2 border-t border-border/60">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">
                        What problem are you solving?
                      </label>
                      <textarea
                        name="problem"
                        value={formData.problem}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe the main frustration or inefficiency your customers face..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">
                        What is your solution?
                      </label>
                      <textarea
                        name="solution"
                        value={formData.solution}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Explain how your product works and how it addresses the problem above..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Target Audience & Business Model */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">
                        Target Audience / Customer Segments
                      </label>
                      <textarea
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Who is this specifically for? (e.g. freelance copywriters, boutique legal firms)"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-muted-foreground" /> Business Model / Monetization
                      </label>
                      <textarea
                        name="businessModel"
                        value={formData.businessModel}
                        onChange={handleChange}
                        rows={3}
                        placeholder="How do you plan to make money? (e.g. SaaS subscription, transaction fee, freemium)"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <label className="text-sm font-semibold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-muted-foreground" /> Additional Notes
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Any unique insights, unfair advantages, or specific questions you want the AI to answer..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none placeholder:text-muted-foreground"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full sm:w-auto px-8 gap-2 shadow-glow hover:shadow-glow-lg transition-all duration-300"
                >
                  Analyze with AI
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
