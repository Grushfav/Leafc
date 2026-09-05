import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leafc.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LEAF-C | Investigative & Compliance Agency",
    template: "%s | LEAF-C",
  },
  description:
    "Multidisciplinary investigative, compliance, and training services for public and private sector clients.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LEAF-C",
    title: "LEAF-C | Investigative & Compliance Agency",
    description:
      "Multidisciplinary investigative, compliance, and training services for public and private sector clients.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LEAF-C | Investigative & Compliance Agency",
    description:
      "Multidisciplinary investigative, compliance, and training services for public and private sector clients.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d2a4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
