import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { getUser } from "@/lib/auth";
import { UserNav } from "@/components/auth/user-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bartender Inventory System",
  description: "A comprehensive inventory management solution for bars",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          {user && (
            <header className="border-b bg-white">
              <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Bartender Inventory</h1>
                <UserNav user={user} />
              </div>
            </header>
          )}
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
