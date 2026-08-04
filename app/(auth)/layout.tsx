import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">FoundryAI</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
