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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leafc.net";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LEAF-C | Law Enforcement Against Financial Crimes",
    template: "%s | LEAF-C",
  },
  description:
    "LEAF-C — Law Enforcement Against Financial Crimes. Multidisciplinary investigative, compliance, and training services for public and private sector clients.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "LEAF-C",
    title: "LEAF-C | Law Enforcement Against Financial Crimes",
    description:
      "LEAF-C — Law Enforcement Against Financial Crimes. Multidisciplinary investigative, compliance, and training services for public and private sector clients.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LEAF-C | Law Enforcement Against Financial Crimes",
    description:
      "LEAF-C — Law Enforcement Against Financial Crimes. Multidisciplinary investigative, compliance, and training services for public and private sector clients.",
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
