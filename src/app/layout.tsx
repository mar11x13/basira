import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "BASIRA — Islamic Guidance, Verified",
  description:
    "BASIRA (بصيرة) helps Muslims find reliable Islamic guidance: the Qur'an, authentic hadith from Sahih al-Bukhari, duas, dhikr, and grounded answers — always with traceable sources.",
  keywords: ["BASIRA", "Islam", "Quran", "Hadith", "Sahih al-Bukhari", "Dua", "Dhikr", "Prayer times", "Islamic guidance"],
  applicationName: "BASIRA",
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icons/icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
      {
        url:
          "data:image/svg+xml," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E6B5E"/><path d="M40 14a18 18 0 1 0 0 36 22 22 0 1 1 0-36z" fill="#E8D9A8"/><circle cx="45" cy="32" r="3" fill="#E8D9A8"/></svg>`
          ),
        type: "image/svg+xml",
      },
    ],
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "BASIRA — Islamic Guidance, Verified",
    description: "Qur'an, Sahih al-Bukhari hadith, duas and grounded answers with traceable sources.",
    siteName: "BASIRA",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BASIRA",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F2" },
    { media: "(prefers-color-scheme: dark)", color: "#101715" },
  ],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Figtree:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
