import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospect — Local prospecting workspace",
  description: "A focused workspace for finding and following up with local prospects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
