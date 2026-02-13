import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP, Noto_Sans_KR, Noto_Sans_SC, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { CookieConsentBanner } from "@/components/common/cookie-consent-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-noto-jp" });
const notoKR = Noto_Sans_KR({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-noto-kr" });
const notoSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-noto-sc" });
const notoAR = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-noto-ar" });

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    viewportFit: "cover",
};

export const metadata: Metadata = {
    title: {
        default: "ATLVS - Unified Operations Platform",
        template: "%s | ATLVS",
    },
    description: "Enterprise operations management for live events, productions, and creative agencies.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    icons: {
        icon: "/favicon.ico",
    },
    openGraph: {
        type: "website",
        siteName: "ATLVS",
        title: "ATLVS - Unified Operations Platform",
        description: "Enterprise operations management for live events, productions, and creative agencies.",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${notoJP.variable} ${notoKR.variable} ${notoSC.variable} ${notoAR.variable} ${inter.className}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Providers>
                        {children}
                        <Toaster />
                        <CookieConsentBanner />
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
