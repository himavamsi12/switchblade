import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Averia_Serif_Libre, Inter, Archivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CustomCursor } from "@/components/shared/CustomCursor";

const averiaSerif = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-averia",
  display: "swap",
});

// Site-wide replacement for Barlow — kept on the same --font-barlow CSS variable so every
// existing `var(--font-barlow)` / `font-barlow` reference across the site picks it up with no
// other changes. This is a single-weight display font (no 300-900 range like Barlow had), so it
// renders at its own native weight regardless of any font-weight the CSS asks for.
const barlow = localFont({
  src: "../../public/classics/TBJ One More Demo.ttf",
  variable: "--font-barlow",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-ibm",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SWITCHBLADE™ — Anything but Everything",
  description: "A philosophy applied to whatever it touches.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior="smooth" is REQUIRED here because globals.css sets
    // `html { scroll-behavior: smooth }` (for in-page anchor links). As of Next.js 16, the router
    // no longer overrides that during a route transition on its own — so its scroll-to-top on
    // navigation was being handed to the browser's native SMOOTH scroller, which then got cut off
    // by the incoming page's render/layout shifts and left you sitting wherever you clicked from
    // (click a footer link → land in the new page's footer instead of its hero). This attribute
    // opts back into the pre-16 behavior: Next flips scroll-behavior to `auto` for the duration of
    // the navigation, jumps instantly to the top, then restores `smooth` for anchor links.
    // See node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md → "Scroll Behavior
    // Override".
    <html lang="en" data-scroll-behavior="smooth" className={`${barlow.variable} ${ibmPlex.variable} ${ibmPlexMono.variable} ${averiaSerif.variable} ${inter.variable} ${archivo.variable}`}>
      <body suppressHydrationWarning className="bg-[#F2EDE4] text-[#0D0D0D] font-[family-name:var(--font-barlow)] antialiased">
        <CustomCursor />
        <main>{children}</main>
      </body>
    </html>
  );
}
