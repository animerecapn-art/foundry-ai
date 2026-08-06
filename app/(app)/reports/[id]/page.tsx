'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Brain, AlertTriangle, Lightbulb,
  ShieldAlert, Sparkles, TrendingUp, Users, Target, DollarSign,
  Rocket, Megaphone, Milestone, Quote, CheckCircle, Loader2,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/shared/progress-ring';
import { supabase } from '@/lib/supabase/client';
import { cn, formatDate, getScoreColor } from '@/lib/utils';
import type { OpenAIReport } from '@/types';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [check, setCheck] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('reality_checks')
          .select('*, ideas(*)')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setCheck(data);
      } catch (err) {
        console.error('Failed to load report:', err);
        setError(err instanceof Error ? err.message : 'Report not found');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadReport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Retrieving report details...</p>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-bold">Failed to load report</h2>
        <p className="text-sm text-muted-foreground mt-1">{error || 'Report record not found.'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }

  // Parse insights package structure
  const hasFullPackage = check.insights && typeof check.insights === 'object' && !Array.isArray(check.insights);
  const inputs = hasFullPackage ? check.insights.inputs : {
    title: check.ideas?.title || 'Unknown Startup',
    category: check.ideas?.category || 'Other',
    stage: check.ideas?.stage || 'concept',
    country: check.market_size || 'Global',
    oneLinePitch: check.ideas?.description || '',
    problem: '',
    solution: '',
    targetAudience: '',
    businessModel: '',
  };

  const report: OpenAIReport = hasFullPackage ? check.insights.report : {
    realityScore: check.overall_score || 0,
    summary: Array.isArray(check.insights) ? check.insights[0] || 'AI reality check report.' : 'AI reality check report.',
    strengths: Array.isArray(check.insights) ? check.insights.slice(1, 4) : ['Clear value proposition', 'Fast time-to-market'],
    weaknesses: ['High dependency on initial acquisition', 'Resource constraints'],
    risks: check.risks || [],
    opportunities: check.opportunities || [],
    competitors: ['Direct niche products', 'Legacy manual operations'],
    targetCustomers: ['Tech-savvy early adopters'],
    monetization: [check.market_size || 'Subscription model'],
    mvpFeatures: ['Landing page sign-up form', 'Core dashboard analytics'],
    marketingIdeas: ['Content marketing focusing on pain point', 'Direct outreach to pilot users'],
    launchRoadmap: ['Phase 1: Build basic concept', 'Phase 2: Onboard early beta users'],
    investorOpinion: 'The project shows core viability in this segment. Focus should be on proving CAC efficiency and building early user retention.',
    finalVerdict: 'A solid starting point. Build a lightweight landing page or MVP prototype within 2-3 weeks to test customer acquisition demand before scaling.'
  };

  const score = report.realityScore;
  const version = hasFullPackage ? check.insights.version : 1;

  // Custom function for export pdf simulation
  const handleExportPdf = () => {
    alert('Exporting report as PDF... (Feature simulated for demo)');
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Back button & Action Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to list
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none gap-1.5 h-9 text-xs"
            onClick={() => router.push(`/ai-cofounder?ideaId=${check.idea_id}`)}
          >
            <Bot className="w-4 h-4 text-primary" />
            Discuss with Co-founder
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none gap-1.5 h-9 text-xs"
            onClick={handleExportPdf}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Header Profile */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-md relative overflow-hidden">
        {/* Glow corner */}
        <div className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl", 
          score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
        )} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="info" className="px-2 py-0.5 text-xs font-semibold">
                {inputs.category}
              </Badge>
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                Stage: {inputs.stage}
              </Badge>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                v{version}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{inputs.title}</h1>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              {inputs.oneLinePitch || 'No one-line pitch provided.'}
            </p>
            <div className="text-xs text-muted-foreground/60 pt-1">
              Analyzed on {formatDate(check.created_at)} using {check.model_used}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
            <ProgressRing value={score} size={88} strokeWidth={7} />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reality Score</p>
              <p className={cn("text-2xl font-display font-bold", getScoreColor(score))}>
                {score} <span className="text-muted-foreground/40 text-sm font-normal">/ 100</span>
              </p>
              <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                {score >= 80 ? "Highly Viable" : score >= 60 ? "Moderate Potential" : "High Risk / Pivot Recommended"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Report Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Summary & Scores */}
        <div className="md:col-span-2 space-y-6">
          {/* Executive Summary */}
          <Card className="hover-lift">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.summary}
              </p>
            </CardContent>
          </Card>

          {/* Comparative Grid 1: Strengths & Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-emerald-500/20 bg-emerald-500/[0.01] hover-lift">
              <CardHeader className="pb-3 border-b border-emerald-500/10">
                <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Core Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {report.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-red-500/20 bg-red-500/[0.01] hover-lift">
              <CardHeader className="pb-3 border-b border-red-500/10">
                <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" /> Key Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {report.weaknesses.map((weak, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{weak}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Comparative Grid 2: Opportunities & Risks */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Opportunities */}
            <Card className="border-emerald-500/20 bg-emerald-500/[0.01] hover-lift">
              <CardHeader className="pb-3 border-b border-emerald-500/10">
                <CardTitle className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {report.opportunities.map((opp, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Hidden Risks */}
            <Card className="border-amber-500/20 bg-amber-500/[0.01] hover-lift">
              <CardHeader className="pb-3 border-b border-amber-500/10">
                <CardTitle className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Hidden Risks & Blindspots
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {report.risks.map((risk, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Competitors & Customers */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Competitors */}
            <Card className="hover-lift">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Competitors & Alternatives
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {report.competitors.map((comp, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{comp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Target Customers */}
            <Card className="hover-lift">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Target Customers & Personas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {report.targetCustomers.map((cust, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{cust}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side: Monetization, MVP, Roadmap, Verdict */}
        <div className="space-y-6">
          {/* Revenue Model */}
          <Card className="hover-lift">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Revenue Model
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {report.monetization.map((mon, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/40">
                    {mon}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommended MVP Features */}
          <Card className="hover-lift">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary" /> Recommended MVP
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {report.mvpFeatures.map((feat, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Marketing Ideas */}
          <Card className="hover-lift">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" /> Marketing Ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2.5">
                {report.marketingIdeas.map((idea, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{idea}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Launch Roadmap Timeline */}
      <Card className="hover-lift">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <Milestone className="w-5 h-5 text-primary" /> Launch Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-4 justify-between">
            {/* Horizontal progress bar for desktop, vertical for mobile */}
            <div className="absolute left-3.5 md:left-0 md:top-4 bottom-0 md:bottom-auto md:right-0 h-full md:h-0.5 w-0.5 md:w-full bg-border -z-10" />

            {report.launchRoadmap.map((step, i) => (
              <div key={i} className="relative z-10 flex md:flex-col gap-4 md:gap-3 items-start flex-1">
                {/* Node */}
                <div className="w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 shadow-sm">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Phase {i + 1}</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investor Opinion & Verdict Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Investor Opinion */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/[0.01] hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Quote className="w-4 h-4 text-primary" /> Investor Opinion
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <p className="text-xs text-muted-foreground italic leading-relaxed pl-4 border-l-2 border-primary/45 font-serif text-sm">
              &ldquo;{report.investorOpinion}&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* Final Verdict */}
        <Card className="border-brand-gradient/30 bg-gradient-to-br from-primary/5 to-blue-500/5 hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-primary" /> Final Verdict
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-xs font-medium text-foreground leading-relaxed">
              {report.finalVerdict}
            </p>
            <Button
              className="w-full mt-4 text-xs gap-1.5 h-8"
              variant="gradient"
              onClick={() => router.push(`/ai-cofounder?ideaId=${check.idea_id}`)}
            >
              <Bot className="w-3.5 h-3.5" />
              Discuss Improvements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
