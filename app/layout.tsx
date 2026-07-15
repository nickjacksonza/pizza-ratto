import type { Metadata } from "next";
import { Anton, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Anton({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const body = Space_Grotesk({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Pizza Ratto | Wood-Fired Pizza in Salt River, Cape Town",
  description: "Hand-stretched, wood-fired pizza in Salt River. Pizza, coffee and dolci from Monday to Saturday, 10:00–18:00.",
  icons: { icon: "/images/pizza-ratto-logo-art.png", apple: "/images/pizza-ratto-logo-art.png" },
  openGraph: { title: "Pizza Ratto — Italian soul. Street-corner attitude.", description: "Wood-fired pizza in Salt River, Cape Town.", type: "website", locale: "en_ZA", siteName: "Pizza Ratto", images: [{ url: "/og.png", width: 1792, height: 933, alt: "Pizza Ratto — made fresh, taken seriously by no one" }] },
  twitter: { card: "summary_large_image", title: "Pizza Ratto", description: "Wood-fired in Salt River. Fired with intent.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${body.variable}`}>{children}</body></html>;
}
