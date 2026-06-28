import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { themeInitScript } from "@/components/landing/theme-toggle";
import "./tokens.css";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KUSTIO - Custom Exercise Video Programs",
  description:
    "Upload exercise videos, build programs with sets, reps, time, and weight, and deliver video programs with auto-generated PDFs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={plusJakarta.variable}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
