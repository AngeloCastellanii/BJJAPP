import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

export const dynamic = "force-dynamic";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BJJApp",
    template: "%s · BJJApp",
  },
  description:
    "Comunidad de jiu-jitsu: amigos, academia, roladas, peleas y ranking.",
  applicationName: "BJJApp",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BJJApp",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "BJJApp",
    description:
      "Comunidad de jiu-jitsu: amigos, academia, roladas, peleas y ranking.",
    siteName: "BJJApp",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary",
    title: "BJJApp",
    description:
      "Comunidad de jiu-jitsu: amigos, academia, roladas, peleas y ranking.",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F1EE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <RegisterSW />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
