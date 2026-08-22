"use client";

import { usePathname } from "next/navigation";
import AppLayout from "./AppLayout";
import { ErrorBoundary } from "./ErrorBoundary";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Public routes that don't need the sidebar layout
  const isPublicRoute = pathname === "/" || pathname === "/signin" || pathname === "/signup";

  if (isPublicRoute) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return (
    <ErrorBoundary>
      <AppLayout>{children}</AppLayout>
    </ErrorBoundary>
  );
}
