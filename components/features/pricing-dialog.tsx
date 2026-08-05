'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useAppStore } from '@/store/app-store';

const features = [
  'Unlimited AI Reality Checks (no rate limits)',
  'Detailed market size & ICP evaluation reports',
  'Interactive AI Co-Founder strategy chat',
  'Export reports to PDF & share with investors',
  'Advanced competitor intelligence matrix',
  'Priority access to new AI models & features',
];

export function PricingDialog() {
  const { upgradeDialogOpen, setUpgradeDialogOpen } = useAppStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Load Razorpay script dynamically
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 2. Create order on backend
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment order');
      }

      // 3. Configure Razorpay checkout options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'FoundryAI',
        description: 'Upgrade to Pro Plan (Premium Access)',
        order_id: data.orderId,
        handler: async function (response: any) {
          setLoading(true);
          try {
            // 4. Verify payment signature on backend
            const verifyResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed');
            }

            // Upgraded successfully! Show success screen
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              setUpgradeDialogOpen(false);
              window.location.reload(); // Reload page to update UI state and badges
            }, 2500);
          } catch (err: any) {
            alert(err.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: user.email || '',
        },
        theme: {
          color: '#8b5cf6', // Brand violet color matching FoundryAI design
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  return (
    <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden border-border/80">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="pricing-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              {/* Premium Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gradient" />

              <DialogHeader className="pt-2 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <DialogTitle className="font-display text-2xl font-bold tracking-tight">
                  Unlock FoundryAI Pro
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Supercharge your startup validation process. Validate, iterate, and launch without limits.
                </DialogDescription>
              </DialogHeader>

              {/* Pricing Tag */}
              <div className="my-6 text-center rounded-2xl bg-muted/50 border py-5 border-border/60">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pro Plan Access</p>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-4xl font-display font-bold tracking-tight">₹1,599</span>
                  <span className="text-muted-foreground text-sm font-medium">/ month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cancel anytime. 7-day money-back guarantee.</p>
              </div>

              {/* Feature List */}
              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Everything in Free, plus:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground leading-tight text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleUpgrade}
                variant="gradient"
                className="w-full py-6 font-semibold shadow-glow text-base gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing Checkout...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro Now
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">Welcome to Pro, Founder! 🚀</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-xs">
                Your payment was processed successfully. All premium AI models and reports are now unlocked.
              </p>
              <p className="text-xs text-muted-foreground mt-4 animate-pulse">Refreshing workspace...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
