import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/top-bar";
import { CmdKProvider } from "@/components/cmd-k";
import { ToastProvider } from "@/components/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nabo — The Notepad That Executes",
  description:
    "A collaborative notepad for digital paid ads marketing managers. Write the strategy, and the notepad helps you execute it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <TooltipProvider>
          <CmdKProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <TopBar />
                <main className="flex-1">{children}</main>
              </div>
            </ToastProvider>
          </CmdKProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
