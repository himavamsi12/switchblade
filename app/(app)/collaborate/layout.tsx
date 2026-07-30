import type { Metadata } from "next";

// page.tsx here is a Client Component ("use client", for its scroll-driven star choreography),
// and Next.js only allows a `metadata` export from a Server Component — hence this layout, whose
// only job is supplying that metadata and passing children through untouched.
export const metadata: Metadata = {
  title: "Collaborate with SWITCHBLADE™ — Let's Build Something Real",
  description:
    "Not selling — connecting. Pitch a collaboration built on shared storytelling, real friendship, and a co-authored release with SWITCHBLADE™.",
};

export default function CollaborateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
