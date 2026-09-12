import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Word Nest",
  description: "Turn the English you meet into words you remember.",
};

export const viewport: Viewport = {
  themeColor: "#f5f4ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-dvh w-full max-w-3xl pb-28">
          <main>{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
