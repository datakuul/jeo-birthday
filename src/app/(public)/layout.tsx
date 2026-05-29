import { LiteModeProvider } from "@/components/lite-mode";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiteModeProvider>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </LiteModeProvider>
  );
}
