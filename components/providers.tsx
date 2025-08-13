"use client";

import { SessionProvider } from "next-auth/react";
import { trpc } from "@/lib/trpc/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

export default trpc.withTRPC(Providers);