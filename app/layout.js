import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import ThemeProvider from '@/components/ThemeProvider';
import MouseFollower from '@/components/MouseFollower';
import PageLoader from '@/components/PageLoader';

const inter = Inter({ 
    subsets: ['latin'], 
    variable: '--font-inter',
    display: 'swap',
});
const playfair = Playfair_Display({ 
    subsets: ['latin'], 
    variable: '--font-playfair',
    display: 'swap',
});

export const metadata = {
    title: 'CareerForge AI — Build Your Future, Automatically',
    description: 'Stop writing resumes. Start landing interviews. Our AI crafts perfect CVs while automatically matching you with your dream jobs.',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/apple-touch-icon.svg',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <Suspense fallback={null}>
                        <PageLoader />
                    </Suspense>
                    <MouseFollower />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
