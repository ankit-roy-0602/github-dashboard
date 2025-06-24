import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "./globals.css";
import './output.css'
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub API Dashboard",
  description:
    "Comprehensive GitHub API integration with webhooks and security monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-github-50 to-github-100">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
