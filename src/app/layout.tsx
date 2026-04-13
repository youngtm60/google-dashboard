import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import Sidebar from "@/components/layout/Sidebar";

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
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <main style={{ 
              flex: 1, 
              marginLeft: "var(--sidebar-width)",
              padding: "40px",
              width: "100%",
              height: "100vh",
              overflow: "hidden"
            }}>
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
