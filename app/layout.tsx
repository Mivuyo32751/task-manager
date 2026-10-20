import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groovy — Your music, your flow",
  description: "Discover trending artists and daily playlists on Groovy.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
