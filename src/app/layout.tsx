import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/lib/SidebarContext";
import NowstaSidebar from "@/components/layout/NowstaSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nebula Workspace | Google Dashboard",
  description: "Your centralized premium Google Workspace dashboard.",
};

import { Suspense } from "react";

import MainContent from "@/components/layout/MainContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <SidebarProvider>
            <div style={{ display: "flex", minHeight: "100vh" }}>
              <Suspense fallback={<div style={{ width: "280px" }} />}>
                <Sidebar />
              </Suspense>
              <MainContent>
                <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>}>
                  {children}
                </Suspense>
              </MainContent>
              <NowstaSidebar />
            </div>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
