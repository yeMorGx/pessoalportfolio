import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://pessoalportfolio.vercel.app"),
  title: "Gabriel Morgado | Full-stack Developer",
  description: "Gabriel Morgado's portfolio: digital products across interfaces, systems and security.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }]
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = (await headers()).get("x-site-language") ?? "en";

  return (
    <html lang={language}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
