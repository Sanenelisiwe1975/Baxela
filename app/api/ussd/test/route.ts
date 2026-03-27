import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>USSD Test — Baxela</title>
  <style>
    body { font-family: monospace; max-width: 520px; margin: 40px auto; padding: 0 16px; background: #0f0f0f; color: #e0e0e0; }
    h1 { font-size: 1.2rem; color: #9b7bfe; }
    label { display: block; margin: 8px 0 2px; font-size: 0.8rem; color: #888; }
    input { width: 100%; box-sizing: border-box; padding: 6px 8px; background: #1e1e1e; border: 1px solid #333; color: #e0e0e0; border-radius: 4px; font-family: monospace; }
    button { margin-top: 12px; padding: 8px 20px; background: #9b7bfe; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
    button:hover { background: #7c5ce0; }
    pre { margin-top: 20px; padding: 12px; background: #1e1e1e; border: 1px solid #333; border-radius: 4px; white-space: pre-wrap; word-break: break-word; min-height: 60px; color: #a8ff78; }
    .hint { font-size: 0.75rem; color: #555; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>USSD Test Interface — Baxela</h1>
  <p class="hint">Simulates Africa's Talking USSD callbacks. Change <code>text</code> to walk through the flow (e.g. "", "1", "1*Soweto", "1*Soweto*2", "1*Soweto*2*Ballots were stuffed").</p>

  <form id="ussd-form" method="POST" action="/api/ussd">
    <label for="sessionId">sessionId</label>
    <input id="sessionId" name="sessionId" value="test-session-001" />

    <label for="serviceCode">serviceCode</label>
    <input id="serviceCode" name="serviceCode" value="*120*BAXELA#" />

    <label for="phoneNumber">phoneNumber</label>
    <input id="phoneNumber" name="phoneNumber" value="+27821234567" />

    <label for="text">text <span class="hint">(user input, * separated)</span></label>
    <input id="text" name="text" value="" placeholder="Leave empty for main menu" />

    <button type="submit">Send</button>
  </form>

  <pre id="response">Response will appear here…</pre>

  <script>
    document.getElementById('ussd-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const pre = document.getElementById('response');
      pre.textContent = 'Sending…';
      try {
        const res = await fetch('/api/ussd', { method: 'POST', body: data });
        const text = await res.text();
        pre.textContent = text;
      } catch (err) {
        pre.textContent = 'Error: ' + err.message;
      }
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
