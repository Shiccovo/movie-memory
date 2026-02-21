import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Movie Memory",
  description: "Remember fun facts about your favorite movie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-gradient-anim`}
      >
        <SessionProvider>
          <div className="min-h-screen flex flex-col bg-gradient-anim">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
