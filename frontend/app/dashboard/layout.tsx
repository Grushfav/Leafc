import { SiteHeader } from "@/components/layout/SiteHeader";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
