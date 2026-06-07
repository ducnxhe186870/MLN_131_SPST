"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <main className={`${isHomePage ? "pt-[200px]" : "pt-[72px]"} min-h-screen`}>
      {children}
    </main>
  );
}
