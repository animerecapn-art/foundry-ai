import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FoundryAI – Build Better Ideas',
    template: '%s | FoundryAI',
  },
  description:
    'FoundryAI is an AI-powered platform where entrepreneurs capture startup ideas, validate them with structured AI analysis, and track their journey from idea to launch.',
  keywords: ['startup', 'ideas', 'AI', 'validation', 'entrepreneurship', 'SaaS'],
  authors: [{ name: 'FoundryAI Team' }],
  openGraph: {
    title: 'FoundryAI – Build Better Ideas',
    description: 'AI-powered startup idea validation and tracking platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
