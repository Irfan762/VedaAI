import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import LayoutClientWrapper from './LayoutClientWrapper';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

 

export const metadata: Metadata = {
  title: 'VedaAi | Advanced AI Assessment & Exam Creator Platform',
  description: 'Design premium, highly custom, structured assessments and exam papers using next-generation AI pipelines.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased mesh-bg min-h-screen flex flex-col transition-colors duration-300">
        <LayoutClientWrapper>
          {children}
        </LayoutClientWrapper>
      </body>
    </html>
  );
}
