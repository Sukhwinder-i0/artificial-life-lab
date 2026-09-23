import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARTIFICIAL LIFE LAB - Computational Ecosystem Laboratory",
  description: "A computational artificial-life laboratory platform for research on evolution, natural selection, mutation, adaptation, and emergent population dynamics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
