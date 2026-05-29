import { Resend } from "resend";
import { honoree, event } from "@/content/honoree";
import { formatDate } from "@/lib/utils";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Janet at 80 <celebration@janetolaniru.com>";
const hostContact = process.env.HOST_CONTACT_EMAIL ?? "the family";

const resend = apiKey ? new Resend(apiKey) : null;

type GuestRsvpLine = {
  name: string;
  status: string;
  meal?: string | null;
};

function shell(title: string, bodyHtml: string) {
  // Inline-styled, mobile-friendly, elegant email.
  return `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:Georgia,'Times New Roman',serif;color:#2b2521;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#ffffff;border:1px solid #e7ddcb;border-radius:16px;overflow:hidden;">
      <div style="background:#2b2521;color:#f6efe2;padding:28px 28px 22px;text-align:center;">
        <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#cBa86a;">Celebrating 80 Years</div>
        <div style="font-size:26px;margin-top:8px;">${honoree.fullName}</div>
      </div>
      <div style="padding:28px;">
        <h1 style="font-size:22px;margin:0 0 14px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="border-top:1px solid #efe6d6;padding:20px 28px;font-size:13px;color:#6b6258;">
        <div><strong>${event.venueName}</strong></div>
        <div>${event.addressLine}, ${event.city}</div>
        <div>${formatDate(event.startsAt)}</div>
        <div style="margin-top:10px;">Questions? Reach the host at ${hostContact}.</div>
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#9a9186;margin-top:16px;">
      With love, the family of ${honoree.fullName}.
    </p>
  </div></body></html>`;
}

export async function sendRsvpConfirmation(opts: {
  to: string;
  name: string;
  isUpdate?: boolean;
  guests: GuestRsvpLine[];
  message?: string | null;
}) {
  const attending = opts.guests.filter((g) => g.status === "ATTENDING");
  const rows = opts.guests
    .map(
      (g) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f0e8d8;">${g.name}</td>
         <td style="padding:6px 0;border-bottom:1px solid #f0e8d8;text-align:right;color:#8a7d52;">${prettyStatus(g.status)}${
           g.meal && g.status === "ATTENDING" ? ` · ${prettyMeal(g.meal)}` : ""
         }</td></tr>`,
    )
    .join("");

  const body = `
    <p style="line-height:1.7;">Dear ${escapeHtml(opts.name)},</p>
    <p style="line-height:1.7;">Thank you — your RSVP has been ${
      opts.isUpdate ? "updated" : "received"
    }. We are delighted you responded to celebrate <strong>${honoree.shortName}'s</strong> 80th birthday.</p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:15px;">${rows}</table>
    <p style="line-height:1.7;">${
      attending.length
        ? `We look forward to welcoming ${
            attending.length === 1 ? "you" : `your party of ${attending.length}`
          } on ${formatDate(event.startsAt)}.`
        : "We're sorry you can't make it — thank you for letting us know. You'll be missed."
    }</p>
    ${
      opts.message
        ? `<p style="line-height:1.7;background:#faf5ea;border-left:3px solid #cBa86a;padding:10px 14px;border-radius:4px;font-style:italic;">“${escapeHtml(
            opts.message,
          )}”</p>`
        : ""
    }`;

  const subject = `${opts.isUpdate ? "Your updated RSVP" : "Your RSVP is confirmed"} — ${honoree.shortName}'s 80th`;
  const html = shell(opts.isUpdate ? "RSVP Updated" : "RSVP Confirmed", body);

  return deliver({ to: opts.to, subject, html });
}

export async function sendTributeNotice(opts: {
  author: string;
  relationship?: string | null;
  message: string;
}) {
  const adminTo = (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim();
  if (!adminTo) return { ok: true, skipped: true };
  const html = shell(
    "New tribute awaiting approval",
    `<p style="line-height:1.7;"><strong>${escapeHtml(opts.author)}</strong>${
      opts.relationship ? ` (${escapeHtml(opts.relationship)})` : ""
    } left a tribute:</p>
     <p style="line-height:1.7;background:#faf5ea;padding:12px 14px;border-radius:6px;">${escapeHtml(
       opts.message,
     )}</p>
     <p style="line-height:1.7;">Approve or reject it in the admin tributes page.</p>`,
  );
  return deliver({ to: adminTo, subject: "New tribute to review", html });
}

async function deliver({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    // Dev fallback — no API key configured.
    console.log(`\n📧 [email dev mode] To: ${to}\n   Subject: ${subject}\n   (set RESEND_API_KEY to send real emails)\n`);
    return { ok: true, dev: true };
  }
  try {
    const res = await resend.emails.send({ from, to, subject, html });
    return { ok: !res.error, id: res.data?.id, error: res.error?.message };
  } catch (e) {
    console.error("Email send failed:", e);
    return { ok: false, error: (e as Error).message };
  }
}

function prettyStatus(s: string) {
  return { ATTENDING: "Attending", DECLINED: "Unable to attend", MAYBE: "Maybe", PENDING: "Pending" }[s] ?? s;
}
function prettyMeal(m: string) {
  return (
    { STANDARD: "Standard", VEGETARIAN: "Vegetarian", VEGAN: "Vegan", HALAL: "Halal", CHILD: "Child meal" }[m] ?? m
  );
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
