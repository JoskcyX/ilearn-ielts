import type { Metadata } from "next";
import "@fontsource-variable/figtree/wght.css";
import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ILEARN Spaces | IELTS practice and mock exams",
  description:
    "ILEARN Spaces' practice platform for simulating computer-based IELTS examinations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
