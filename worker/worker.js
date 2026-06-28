const RESEND_KEY = "re_5BHS4WZe_EbSST7w5RdUzbHEDKWAkAwaB";
const FROM_EMAIL = "WatchZone <support@iptvmojo.com>";
const TO_EMAIL   = "contact@thewatchingzone.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

async function sendEmail(subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [TO_EMAIL], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
}

function emailHtml(name, email, whatsapp, source) {
  return `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9f9f9;border-radius:12px">
    <h2 style="color:#1E293B;margin-bottom:20px">📬 New Lead — ${source}</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:10px 0;color:#64748B;font-size:14px;width:120px">Name</td><td style="padding:10px 0;font-weight:700;font-size:14px">${name}</td></tr>
      <tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 0;color:#64748B;font-size:14px">Email</td><td style="padding:10px 0;font-size:14px">${email}</td></tr>
      <tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 0;color:#64748B;font-size:14px">WhatsApp</td><td style="padding:10px 0;font-size:14px">${whatsapp || "—"}</td></tr>
      <tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 0;color:#64748B;font-size:14px">Source</td><td style="padding:10px 0;font-size:14px">${source}</td></tr>
      <tr style="border-top:1px solid #E2E8F0"><td style="padding:10px 0;color:#64748B;font-size:14px">Time</td><td style="padding:10px 0;font-size:14px">${new Date().toUTCString()}</td></tr>
    </table>
  </div>`;
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    try {
      const { name, email, whatsapp, source } = await request.json();
      if (!name || !email) return json({ success: false, error: "Name and email required" }, 400);

      const src = source || "WatchZone";
      await sendEmail(`[${src}] New lead — ${name} <${email}>`, emailHtml(name, email, whatsapp, src));

      return json({ success: true });
    } catch (err) {
      return json({ success: false, error: err.message }, 500);
    }
  },
};
