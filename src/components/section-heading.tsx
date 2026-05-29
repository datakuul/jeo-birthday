import { Reveal } from "@/components/reveal";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="display mt-3 text-3xl text-foreground sm:text-4xl">
        {title}
      </h2>
      <div
        className={
          align === "center" ? "rule-gold mx-auto mt-5" : "rule-gold mt-5"
        }
      />
      {intro && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {intro}
        </p>
      )}
    </Reveal>
  );
}
