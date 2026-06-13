import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bunny AI Portfolio",
  description: "Advanced AI Agent Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark h-full antialiased", "font-sans", geist.variable)}>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
