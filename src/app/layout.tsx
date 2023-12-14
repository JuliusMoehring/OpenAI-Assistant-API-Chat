import { TrpcProvider } from "@/providers/TrpcProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights
import { getServerSession } from "next-auth";

import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/providers/SessionProvider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Agent42",
    description: "OpenAI Assistant",
    metadataBase: "https://mydomain.com",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession();

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <SessionProvider session={session}>
                    <TrpcProvider>
                        <main className="h-screen bg-space-grey-light">
                            <Header />
                            {children}
                        </main>

                        <Toaster />

                        <SpeedInsights />
                    </TrpcProvider>
                </SessionProvider>
            </body>
            <Analytics />
        </html>
    );
}
