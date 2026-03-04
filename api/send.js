const RESEND_API_KEY = 're_QKg6L56R_EvehL1N38v2BRv22Bnr8v87w';
const TO_EMAIL      = 'vlad@vlmedia.online';
const FROM_EMAIL    = 'onboarding@resend.dev';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { name, instagram, email, phone, q2, q3, q4, q5 } = req.body;

  const situationMap = {
    A: 'Runs ads, but results could be better',
    B: 'Has offer & audience, needs content + funnel help',
    C: 'Ads work, but needs better creatives to convert',
    D: 'Just starting out, needs a roadmap',
  };
  const challengeMap = {
    A: 'No time to create content — needs it done-for-them',
    B: 'Content is not getting clients',
    C: 'Ads need better creatives',
    D: 'Needs a funnel that turns content into paying clients',
  };
  const revenueMap = { A: '$0 – $10K/mo', B: '$10K – $30K/mo', C: '$30K – $50K/mo', D: '$50K+/mo' };
  const investMap  = { A: '$0 (not ready yet)', B: '$0 – $500/mo', C: '$500 – $1,000/mo', D: '$1,000+/mo' };

  const pill = (txt, color) =>
    `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${color}22;color:${color};border:1px solid ${color}55">${txt}</span>`;

  const row = (label, val) => val ? `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #13132a;color:#6b7280;font-size:13px;font-weight:500;width:34%;vertical-align:top;padding-right:16px">${label}</td>
      <td style="padding:13px 0;border-bottom:1px solid #13132a;font-size:14px;color:#fff">${val}</td>
    </tr>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#08081a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:580px;margin:32px auto;border-radius:20px;overflow:hidden;border:1px solid #1a1a35;box-shadow:0 24px 64px rgba(0,0,0,0.7)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2a3aff 0%,#1018cc 100%);padding:30px 32px 26px">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5)">VL Agency &mdash; New Lead</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.02em">New Application Received</h1>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.5">Someone just applied to work with you. Reach out within 24 hours.</p>
    </div>

    <!-- Contact -->
    <div style="background:#0f0f1e;padding:24px 32px 8px;border-bottom:1px solid #1a1a30">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5a6aff">Contact Info</p>
      <table style="width:100%;border-collapse:collapse">
        ${row('Name',      `<strong style="color:#fff;font-weight:700">${name}</strong>`)}
        ${instagram ? row('Instagram', `<a href="https://instagram.com/${instagram.replace('@','')}" style="color:#818cf8;text-decoration:none">@${instagram.replace('@','')}</a>`) : ''}
        ${email     ? row('Email',     `<a href="mailto:${email}" style="color:#818cf8;text-decoration:none">${email}</a>`) : ''}
        ${phone     ? row('Phone',     phone) : ''}
      </table>
    </div>

    <!-- Qualification -->
    <div style="background:#0f0f1e;padding:24px 32px 8px;border-bottom:1px solid #1a1a30">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#5a6aff">Qualification</p>
      <table style="width:100%;border-collapse:collapse">
        ${row('Situation',  situationMap[q2] || '—')}
        ${row('Challenge',  challengeMap[q3] || '—')}
        ${row('Revenue',    pill(revenueMap[q4] || '—', '#22c55e'))}
        ${row('Investment', pill(investMap[q5]  || '—', '#f59e0b'))}
      </table>
    </div>

    <!-- Footer -->
    <div style="background:#08081a;padding:18px 32px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;color:#374151">Sent from your VSL landing page</span>
      <span style="font-size:11px;color:#1f2937;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">VL Agency</span>
    </div>

  </div>
</body>
</html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY,
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [TO_EMAIL],
        subject: `New Application: ${name}`,
        html,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Resend error:', data);
      return res.status(r.status).json(data);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send failed:', err);
    return res.status(500).json({ error: err.message });
  }
};
