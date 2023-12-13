import { TrpcProvider } from "@/providers/TrpcProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"; // Import SpeedInsights
import { getServerSession } from "next-auth";

import SessionProvider from "@/providers/SessionProvider";
import { Inter } from "next/font/google";
import "./globals.css";
import Toaster from "./toaster";

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
                        {children}
                        <Toaster />
                        <SpeedInsights />
                    </TrpcProvider>
                </SessionProvider>
            </body>
            <Analytics />
        </html>
    );
}
