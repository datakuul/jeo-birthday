import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { TributeForm } from "@/components/tribute-form";
import { getApprovedTributes } from "@/lib/queries";

// Tributes list is cacheable; new submissions appear after moderation + revalidate.
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Tributes",
  description: "Messages, memories and well-wishes for Mrs. Janet Olaniru.",
};

export default async function TributesPage() {
  const tributes = await getApprovedTributes();

  return (
    <div className="section">
      <div className="container-prose">
        <SectionHeading
          eyebrow="Words of Love"
          title="Tributes & Well-Wishes"
          intro="Friends, family, church and former students share what eighty years of Mrs. Olaniru's life have meant to them. Add your own below."
        />

        <div className="mt-12 columns-1 gap-5 sm:columns-2 [&>*]:mb-5">
          {tributes.map((t, i) => (
            <Reveal key={t.id} delay={(i % 4) * 0.05}>
              <figure
                className={
                  "break-inside-avoid rounded-xl border border-border p-6 shadow-sm " +
                  (t.isFeatured ? "bg-gold-soft/40" : "bg-surface")
                }
              >
                <Quote className="size-5 text-gold-strong/60" aria-hidden />
                <blockquote className="mt-3 text-[1.02rem] leading-relaxed text-foreground/90">
                  {t.message}
                </blockquote>
                <figcaption className="mt-4 border-t border-border/60 pt-3">
                  <p className="font-serif text-base text-foreground">{t.author}</p>
                  {t.relationship && (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t.relationship}
                    </p>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <SectionHeading
            eyebrow="Add Your Voice"
            title="Leave a Tribute"
            align="center"
          />
          <div className="mt-8">
            <TributeForm />
          </div>
        </div>
      </div>
    </div>
  );
}
