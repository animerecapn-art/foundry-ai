'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase/client';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

const benefits = [
  '5 AI Reality Checks per month, free',
  'Unlimited idea capture & organization',
  'Launch checklist & progress tracking',
  'No credit card required',
];

export default function SignupPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    // Check if email confirmation is required
    setSuccess(true);
    // If email confirmation disabled in Supabase → redirect to dashboard
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Account created!</h2>
          <p className="text-muted-foreground text-sm">Taking you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left – Copy */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Build better ideas, <span className="gradient-text">faster.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Join 12,000+ founders using FoundryAI to validate their startup ideas before investing time and money.
          </p>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-4 pt-8 border-t border-border">
            <div className="flex -space-x-2">
              {['S', 'M', 'P', 'J', 'A'].map((initial, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-brand-gradient text-white text-xs font-semibold flex items-center justify-center border-2 border-background">
                  {initial}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium">12,000+ founders</p>
              <p className="text-xs text-muted-foreground">joined this month</p>
            </div>
          </div>
        </motion.div>

        {/* Right – Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-2xl border bg-card p-8 shadow-card">
          <h2 className="font-display text-xl font-bold mb-6">Create your account</h2>

          {authError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="Alex Morgan" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Work Email</label>
              <Input type="email" placeholder="alex@company.com" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="At least 6 characters" {...register('password')} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" variant="gradient" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">Get started free <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">Terms</Link> and{' '}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
