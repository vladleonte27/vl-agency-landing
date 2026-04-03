const RESEND_API_KEY = 're_QKg6L56R_EvehL1N38v2BRv22Bnr8v87w';
const TO_EMAIL      = 'vlad@vlmedia.online';

// Primary: verified custom domain. Fallback: Resend test sender.
const FROM_PRIMARY  = 'VL Agency <notifications@vlmedia.online>';
const FROM_FALLBACK = 'VL Agency <onboarding@resend.dev>';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const { name, instagram, email, phone, q2, q3, q4 } = body;

  const situationMap = {
    A: 'Needs better creatives to spend and convert more',
    B: 'Needs help delegating content and building a proven funnel',
    C: 'Just starting out, needs a roadmap',
  };
  const challengeMap = {
    A: 'No time to create content — needs it done-for-them',
    B: 'Content is not getting clients',
    C: 'Ads need better creatives',
    D: 'Needs a funnel that turns content into paying clients',
  };
  const revenueMap = {
    A: '$0 – $10K/mo',
    B: '$10K – $50K/mo',
    C: '$50K – $100K/mo',
    D: '$100K+/mo',
  };

  const challengeLabels = (q3 || '').split(',')
    .map(k => challengeMap[k.trim()]).filter(Boolean).join(' · ');

  const pill = (txt, color) =>
    `<span style="display:inline-block;padding:4px 14px;border-radius:100px;font-size:12px;font-weight:700;letter-spacing:0.04em;background:${color}22;color:${color};border:1px solid ${color}44">${txt}</span>`;

  const row = (label, val) => val ? `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #16163a;color:#5a6080;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;width:28%;vertical-align:top;padding-right:20px">${label}</td>
      <td style="padding:14px 0;border-bottom:1px solid #16163a;font-size:14px;font-weight:500;color:#c8cff0;line-height:1.5">${val}</td>
    </tr>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06060f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="max-width:600px;margin:32px auto;padding:0 16px">

  <div style="border-radius:20px 20px 0 0;background:linear-gradient(135deg,#202cff 0%,#1018bb 100%);padding:32px 36px 28px;position:relative">
    <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)"></div>
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4)">VL Agency &mdash; New Lead</p>
    <h1 style="margin:0 0 10px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.03em">New Application Received</h1>
    <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6">A coach just applied to work with you. Follow up within 24 hours.</p>
  </div>

  <div style="background:#0d0d22;border-left:1px solid #1e1e42;border-right:1px solid #1e1e42;padding:28px 36px 8px">
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#202cff">Contact Info</p>
    <table style="width:100%;border-collapse:collapse">
      ${row('Name',      `<strong style="color:#fff;font-size:16px">${name || '—'}</strong>`)}
      ${instagram ? row('Instagram', `<a href="https://instagram.com/${instagram.replace('@','')}" style="color:#6877ff;text-decoration:none;font-weight:600">@${instagram.replace('@','')}</a>`) : ''}
      ${email     ? row('Email',     `<a href="mailto:${email}" style="color:#6877ff;text-decoration:none">${email}</a>`) : ''}
      ${phone     ? row('Phone',     phone) : ''}
    </table>
  </div>

  <div style="background:#0d0d22;border-left:1px solid #1e1e42;border-right:1px solid #1e1e42;padding:28px 36px 8px">
    <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#202cff">Qualification</p>
    <table style="width:100%;border-collapse:collapse">
      ${row('Situation', situationMap[q2] || '—')}
      ${row('Challenge', challengeLabels || '—')}
      ${row('Revenue',   pill(revenueMap[q4] || '—', '#22c55e'))}
    </table>
  </div>

  <div style="background:#08081a;border:1px solid #1e1e42;border-top:none;border-radius:0 0 20px 20px;padding:18px 36px;display:flex;align-items:center;justify-content:space-between">
    <span style="font-size:12px;color:#2a2a50">Sent from vlmedia.vercel.app</span>
    <span style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#202cff">VL Agency</span>
  </div>

</div>
</body></html>`;

  async function trySend(fromEmail) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY,
      },
      body: JSON.stringify({
        from:    fromEmail,
        to:      [TO_EMAIL],
        subject: `New Application: ${name || 'Unknown'}`,
        html,
      }),
    });
    const data = await r.json();
    return { ok: r.ok, status: r.status, data };
  }

  try {
    console.log(`[send] Attempting primary sender: ${FROM_PRIMARY}`);
    let result = await trySend(FROM_PRIMARY);
    console.log(`[send] Primary result: ${result.status}`, JSON.stringify(result.data));

    if (!result.ok) {
      console.log(`[send] Primary failed, trying fallback: ${FROM_FALLBACK}`);
      result = await trySend(FROM_FALLBACK);
      console.log(`[send] Fallback result: ${result.status}`, JSON.stringify(result.data));
    }

    if (!result.ok) {
      return res.status(result.status).json(result.data);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send] Exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
