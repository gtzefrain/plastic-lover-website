import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plastic Lover",
  description: "New single melting soon. Get it first.",
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
