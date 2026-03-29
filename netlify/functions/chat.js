// Netlify Function: chat.js
// Source: https://developers.netlify.com/guides/migrating-to-the-modern-netlify-functions/
// Source: https://docs.anthropic.com/en/api/messages

const SYSTEM_PROMPT = `You are an AI assistant on Nathan Rubin's personal portfolio website (nathanrubin617.com). Your role is to help visitors learn about Nathan and his work.

ABOUT NATHAN:
Nathan Rubin is a writer, athlete, economist, and storyteller from Boston, MA. He studies Economics, Community Relations, and Diaspora at the Liberal Arts College of UMass Boston. He is passionate about inspiring the next generation through storytelling and community leadership.

HIS BOOK — "CHASING A DREAM":
Nathan's debut children's book "Chasing a Dream" teaches confidence, kindness, and self-belief, encouraging young readers to see the greatness within themselves. Available at local libraries, community centers, youth organizations, and Little Free Library locations. Purchase: https://buy.stripe.com/5kQ8wR1pRfD2dxV1wwgYU02

BASKETBALL:
Nathan is a 2024 graduate of Lexington Christian Academy (EIL Champion, NEPSAC Champion). He now plays basketball at UMass Boston.

CONTACT:
Email: nathanrubin2004@gmail.com | Phone: (617) 840-0068

BEHAVIOR:
Answer warmly about Nathan, his book, his basketball career, and how to contact him. If asked about unrelated topics, briefly acknowledge and redirect back to Nathan and what you can help with on this site. Keep responses concise and conversational.`;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export default async function (req) {
  // Handle OPTIONS preflight (FUNC-06)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders() });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Read API key from environment (FUNC-03) — never hardcoded, never exposed to client
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Parse request body
  let messages;
  try {
    const body = await req.json();
    messages = body.messages;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Call Anthropic Messages API via raw fetch (FUNC-02, D-01) — no npm SDK
  let anthropicResponse;
  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages
      })
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach Anthropic API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  if (!anthropicResponse.ok) {
    return new Response(JSON.stringify({ error: 'Anthropic API error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Extract reply from Anthropic response shape: content[0].text
  const data = await anthropicResponse.json();
  const reply = data.content[0].text;

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
