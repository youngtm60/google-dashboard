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
              <Sidebar />
              <main className="main-content">
                {children}
              </main>
              <NowstaSidebar />
            </div>
          </SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
