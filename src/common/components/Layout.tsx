import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";

// `min-h-screen` + `flex-col` + `flex-1` on <main> is the classic CSS
// trick for a "sticky footer": the footer sits at the bottom of the
// viewport on short pages, but gets pushed down naturally on long
// pages instead of overlapping content. Without flex-1 on <main>,
// the footer would float awkwardly mid-page whenever content is short.
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f1c]">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}