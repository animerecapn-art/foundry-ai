'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, ArrowRight, Lightbulb, BarChart3, Rocket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: Lightbulb, text: 'Capture & organize startup ideas' },
  { icon: BarChart3, text: 'AI-powered reality check scoring' },
  { icon: Rocket, text: 'Track idea to launch journey' },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/dashboard';
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setAuthError(error.message);
      return;
    }
    router.push(redirectedFrom);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – Brand Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-[hsl(262,70%,15%)] via-[hsl(240,60%,12%)] to-[hsl(220,70%,8%)]">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/15 blur-[60px]" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium mb-8 backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              AI-Powered Startup Platform
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight mb-4">
              Turn your ideas into{' '}
              <span className="gradient-text">billion-dollar startups</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Validate, track, and launch your startup ideas with the power of AI — all in one beautiful workspace.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-12 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Icon className="w-4 h-4" style={{ color: 'hsl(262,70%,75%)' }} />
                </div>
                <span className="text-sm text-white/80">{text}</span>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-sm text-white/80 italic leading-relaxed">
              &ldquo;FoundryAI saved me 3 months and $40K by validating my idea&apos;s market size before I hired a team.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-xs font-bold">SC</div>
              <div>
                <p className="text-xs font-semibold">Sarah Chen</p>
                <p className="text-xs text-white/50">Founder @ Loopify</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right – Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to your FoundryAI workspace</p>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="alex@company.com" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input type="password" placeholder="••••••••" {...register('password')} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="gradient" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">Sign up free</Link>
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-9 text-sm gap-2" onClick={handleGoogleLogin} type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/></svg>
              Google
            </Button>
            <Button variant="outline" className="h-9 text-sm gap-2" onClick={handleGitHubLogin} type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
