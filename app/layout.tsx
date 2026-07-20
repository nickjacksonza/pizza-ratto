import type { Metadata } from "next";
import { Anton, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Anton({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const body = Space_Grotesk({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pizza-ratto-cpt.zmaqutu.chatgpt.site";
const asset = (path: string) => `${basePath}${path}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Pizza Ratto | Wood-Fired Pizza in Salt River, Cape Town",
  description: "Hand-stretched, wood-fired pizza in Salt River. Pizza, coffee and dolci from Monday to Saturday, 10:00–18:00.",
  icons: { icon: asset("/images/pizza-ratto-logo-art.png"), apple: asset("/images/pizza-ratto-logo-art.png") },
  openGraph: { title: "Pizza Ratto — Italian soul. Street-corner attitude.", description: "Wood-fired pizza in Salt River, Cape Town.", type: "website", locale: "en_ZA", siteName: "Pizza Ratto", url: siteUrl, images: [{ url: asset("/og.png"), width: 1792, height: 933, alt: "Pizza Ratto — made fresh, taken seriously by no one" }] },
  twitter: { card: "summary_large_image", title: "Pizza Ratto", description: "Wood-fired in Salt River. Fired with intent.", images: [asset("/og.png")] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="preload" href={asset("/fonts/vara/satisfy.json")} as="fetch" crossOrigin="anonymous" /></head><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
