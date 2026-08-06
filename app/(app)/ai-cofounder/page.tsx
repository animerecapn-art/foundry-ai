'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Sparkles, Send, Lightbulb, TrendingUp, HelpCircle,
  MessageSquare, Loader2, ArrowRight, Brain, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Idea } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function AiCofounderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlIdeaId = searchParams.get('ideaId');

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all ideas on mount
  useEffect(() => {
    async function loadIdeas() {
      try {
        setLoadingIdeas(true);
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .neq('status', 'archived')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || '',
          category: row.category || 'Other',
          status: row.status,
          stage: row.stage,
          realityScore: row.reality_score || 0,
          version: row.version || 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          tags: [],
          launchProgress: 0,
          checklistCompleted: 0,
          checklistTotal: 25,
          marketScore: 0,
          uniquenessScore: 0,
          feasibilityScore: 0,
        }));

        setIdeas(mapped);

        // Pre-select idea from URL query parameter if present
        if (urlIdeaId && mapped.some(i => i.id === urlIdeaId)) {
          setSelectedIdeaId(urlIdeaId);
        } else if (mapped.length > 0) {
          setSelectedIdeaId('');
        }
      } catch (err) {
        console.error('Failed to load ideas for chat selector:', err);
      } finally {
        setLoadingIdeas(false);
      }
    }
    loadIdeas();
  }, [urlIdeaId]);

  // Handle selected idea change
  useEffect(() => {
    if (selectedIdeaId) {
      const idea = ideas.find(i => i.id === selectedIdeaId) || null;
      setSelectedIdea(idea);
      setError(null);

      // Reset messages with initial co-founder greeting
      if (idea) {
        setMessages([
          {
            role: 'assistant',
            content: `Hi! As your co-founder for **${idea.title}**, I've refreshed my memory on our startup model (Reality Score: ${idea.realityScore}/100). 
            
We're currently in the **${idea.stage}** stage. I'm ready to brainstorm positioning strategies, refine our business model, write features for our MVP, or look at customer acquisition. 

What should we focus on improving today?`,
            createdAt: new Date().toISOString(),
          }
        ]);
      } else {
        setMessages([]);
      }
    } else {
      setSelectedIdea(null);
      setMessages([]);
    }
  }, [selectedIdeaId, ideas]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedIdeaId || sending) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);
    setError(null);

    try {
      const chatHistory = [...messages, userMessage];

      const res = await fetch('/api/ai-cofounder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: selectedIdeaId,
          messages: chatHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get chat response');
      }

      setMessages(prev => [...prev, data.message]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  if (loadingIdeas) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Connecting with Co-Founder...</p>
      </div>
    );
  }

  // Step 10: Empty State when there are no ideas at all in database
  if (ideas.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-glow mb-6">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-foreground">You haven&apos;t analyzed any startup ideas yet.</h2>
        <p className="text-xs text-muted-foreground mt-2 px-8 leading-relaxed">
          You must run an AI Reality Check on a startup concept to activate your AI Co-Founder. This allows the AI to remember your report details and give contextual advice.
        </p>
        <Button variant="gradient" className="mt-6 gap-2" onClick={() => router.push('/reality-checks')}>
          Analyze Your First Idea
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow-sm">
            <Bot className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold">AI Co-Founder</h1>
            <p className="text-xs text-muted-foreground">Contextual strategy partner trained on your reports</p>
          </div>
        </div>

        {/* Startup Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden md:inline">Select Startup:</span>
          <select
            value={selectedIdeaId}
            onChange={(e) => setSelectedIdeaId(e.target.value)}
            className="h-9 w-full sm:w-[220px] rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Choose a startup idea...</option>
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title} (v{idea.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <AnimatePresence mode="wait">
        {!selectedIdeaId ? (
          <motion.div
            key="unselected-state"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl bg-card/45 p-6"
          >
            <MessageSquare className="w-12 h-12 text-muted-foreground/60 mb-3" />
            <h3 className="font-display font-semibold text-sm">Select an idea to start chatting</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Your AI Co-founder needs a startup context to activate. Choose one of your analyzed ideas from the dropdown above.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="chat-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Suggestions Panel (Hidden on Mobile) */}
            <div className="lg:col-span-1 space-y-4 hidden lg:block">
              <Card>
                <CardContent className="p-4 space-y-3.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> Brainstorming
                  </h4>
                  <div className="space-y-2">
                    {[
                      "How can we improve our startup?",
                      "What are our biggest risks?",
                      "Suggest marketing channels",
                      "Draft features for our MVP",
                      "How do we beat competition?",
                    ].map((sug) => (
                      <button
                        key={sug}
                        onClick={() => handleSuggestClick(sug)}
                        className="w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg transition-colors border border-transparent hover:border-border"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 flex flex-col h-[550px] rounded-2xl border bg-card overflow-hidden shadow-sm relative">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((m, i) => {
                  const isAi = m.role === 'assistant';
                  return (
                    <div key={i} className={cn("flex gap-3", !isAi && "justify-end")}>
                      {isAi && (
                        <div className="w-7 h-7 rounded-lg bg-brand-gradient flex-shrink-0 flex items-center justify-center shadow-glow-sm mt-0.5">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-xs md:max-w-md text-xs leading-relaxed whitespace-pre-wrap shadow-sm",
                        isAi 
                          ? "bg-muted text-foreground rounded-tl-sm"
                          : "bg-primary text-white rounded-tr-sm"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}

                {sending && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-gradient flex-shrink-0 flex items-center justify-center shadow-glow-sm mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5 text-xs shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      Co-founder is typing...
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="border-t p-3 bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Message your Co-founder about ${selectedIdea?.title}...`}
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    disabled={sending}
                    className="h-9 text-xs"
                  />
                  <Button type="submit" variant="gradient" size="sm" className="h-9 w-9 px-0 flex items-center justify-center" disabled={sending || !inputMessage.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
