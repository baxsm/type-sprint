import type { Metadata, Viewport } from "next";
import Topbar from "@/components/topbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "type-sprint",
  description:
    "A typing speed game. Race code and prose, track your WPM, and challenge a friend in real time.",
  openGraph: {
    title: "type-sprint",
    description:
      "A typing speed game. Race code and prose, track your WPM, and challenge a friend in real time.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#26293a" },
  ],
};

const noFlashScript = `
  try {
    var stored = localStorage.getItem("type-sprint:theme");
    var dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <Topbar />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
