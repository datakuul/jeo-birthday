import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { honoree } from "@/content/honoree";

export const metadata: Metadata = {
  title: "Scan the Programme",
  description:
    "Scan this code to open the order of ceremony for the 80th birthday celebration.",
  robots: { index: false, follow: false },
};

export default function ProgrammeQrPage() {
  return (
    <div className="section">
      <div className="container-narrow flex flex-col items-center text-center">
        <p className="eyebrow print:hidden">Share the Programme</p>

        {/* The card that reads beautifully on screen and prints cleanly */}
        <div className="mt-6 w-full max-w-sm rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-10">
          <p className="font-serif text-xl text-foreground">
            {honoree.shortName}
            <span className="px-1.5 font-light italic text-muted-foreground/70">
              at
            </span>
            <span className="font-semibold text-gold-strong">80</span>
          </p>
          <div className="rule-gold mx-auto mt-4" />

          <div className="mx-auto mt-8 w-fit rounded-2xl border border-border bg-white p-5 shadow-sm">
            <Image
              src="/programme-qr.svg"
              alt="QR code linking to the celebration programme"
              width={230}
              height={230}
              unoptimized
              priority
            />
          </div>

          <h1 className="mt-8 font-serif text-2xl text-foreground">
            Scan for the Programme
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Open your phone camera and point it at the code to view the full
            order of ceremony.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            janetolaniru.com/programme
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
          <Button asChild variant="outline" size="sm">
            <Link href="/programme">
              <ArrowLeft className="size-4" />
              Back to Programme
            </Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <a href="/programme-qr.png" download>
              <Download className="size-4" />
              Download image
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
