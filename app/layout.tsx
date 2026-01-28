import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import Script from "next/script";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Chess Heatmap | Visualize Your Chess Journey",
        template: "%s | Chess Heatmap"
    },
    description: "Visualize your chess game frequency across Chess.com and Lichess using an interactive heatmap and detailed statistics.",
    keywords: ["chess heatmap", "chess activity", "chess statistics", "lichess stats", "chess.com stats", "chess visualization"],
    authors: [{ name: "Royce", url: "https://royceps.com" }],
    creator: "Royce",
    metadataBase: new URL("https://chessheat.royceps.com"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Chess Heatmap | Visualize Your Chess Journey",
        description: "Visualize your chess game frequency across Chess.com and Lichess using an interactive heatmap and detailed statistics.",
        url: "https://chessheat.royceps.com",
        siteName: "Chess Heatmap",
        images: [
            {
                url: "/logo.png",
                width: 1200,
                height: 630,
                alt: "Chess Heatmap Preview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Chess Heatmap | Visualize Your Chess Journey",
        description: "Visualize your chess game frequency across Chess.com and Lichess.",
        images: ["/logo.png"],
        creator: "@royceps",
    },
    icons: {
        icon: [
            { url: '/favicon.ico?v=2', sizes: 'any', type: 'image/x-icon' },
            { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
        ],
        shortcut: [
            { url: '/favicon.ico?v=2' }
        ],
        apple: [
            { url: '/apple-touch-icon.png?v=2' },
        ],
    },
    manifest: '/site.webmanifest',
};

import { Footer } from "@/app/components/Footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-PHH8F60BWZ"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-PHH8F60BWZ');
                    `}
                </Script>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {children}
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
