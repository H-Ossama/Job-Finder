import './globals.css';
import { Inter, Playfair_Display, Amiri } from 'next/font/google';
import { Suspense } from 'react';
import ThemeProvider from '@/components/ThemeProvider';
import MouseFollower from '@/components/MouseFollower';
import PageLoader from '@/components/PageLoader';
import GeoWrapper from '@/components/GeoWrapper';

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
const amiri = Amiri({
    subsets: ['arabic'],
    weight: ['400', '700'],
    variable: '--font-amiri',
    display: 'swap',
});

export const metadata = {
    title: 'CareerForge AI — Build Your Future, Automatically',
    description: 'Stop writing resumes. Start landing interviews. Our AI crafts perfect CVs while automatically matching you with your dream jobs.',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable} ${amiri.variable}`} suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <Suspense fallback={null}>
                        <PageLoader />
                    </Suspense>
                    <MouseFollower />
                    <GeoWrapper>
                        {children}
                    </GeoWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
