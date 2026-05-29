import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How RSVP and tribute information is collected and used.",
};

const hostEmail = process.env.HOST_CONTACT_EMAIL ?? "the family";

const sections = [
  {
    h: "Who this is for",
    p: [
      "This is a private celebration website created by the family of Mrs. Janet E. Olaniru for her 80th birthday. This notice explains, in plain language, what information we collect when you RSVP or leave a tribute, and how we look after it.",
    ],
  },
  {
    h: "What we collect",
    p: [
      "When you RSVP, we collect the names of guests in your party, your response (attending, declining or maybe), meal preferences, any allergies or accessibility needs you tell us about, an optional message, and the name, email and (optionally) phone number of the person responding.",
      "When you leave a tribute, we collect your name, your relationship to the celebrant (optional), an optional email address, and your message.",
    ],
  },
  {
    h: "Why we collect it",
    p: [
      "We use this information only to plan and host the celebration — to prepare a guest list, arrange seating, cater for dietary and accessibility needs, send you a confirmation, and display approved tributes. We do not use it for advertising, and we do not sell or share it with third parties.",
    ],
  },
  {
    h: "Who can see it",
    p: [
      "Guest and RSVP details are private. They are visible only to the family members organising the event through a password-protected admin area. The public pages of this site never display the guest list or anyone's contact details.",
      "Tributes are reviewed by the family before they appear, and only your name and relationship (not your email) are shown publicly.",
    ],
  },
  {
    h: "How long we keep it",
    p: [
      "We keep RSVP and guest information until shortly after the celebration, after which it is deleted. Approved tributes may be kept as a keepsake unless you ask us to remove yours.",
    ],
  },
  {
    h: "Email",
    p: [
      "If you provide an email address when you RSVP, we use it to send you a confirmation and, if needed, an update about your response. We do not send marketing email.",
    ],
  },
  {
    h: "Your choices",
    p: [
      `You can ask us to correct or delete your information at any time. Simply contact the host at ${hostEmail} and we will take care of it.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="container-narrow">
        <Reveal>
          <p className="eyebrow">In Plain Language</p>
          <h1 className="display mt-4 text-4xl text-foreground sm:text-5xl">
            RSVP &amp; Privacy Notice
          </h1>
          <div className="rule-gold mt-6" />
        </Reveal>

        <div className="prose-warm mt-10 space-y-8">
          {sections.map((s) => (
            <Reveal key={s.h} as="section">
              <h2 className="font-serif text-xl text-foreground">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="mt-2 text-muted-foreground">
                  {para}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
