type Mail = { to: string; subject: string; text: string; html: string };

export async function sendEmail({ to, subject, text, html }: Mail) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    // Production eke key nathnam token eka log wenna dena ba
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    // Dev: terminal eke pennanawa
    console.log(
      `\n[EMAIL - dev only]\nTo: ${to}\nSubject: ${subject}\n${text}\n`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Deora <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) throw new Error(`Email failed with status ${res.status}`);
}
