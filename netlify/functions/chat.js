// Netlify Function: chat.js
// Proxies chat requests to Google Gemini API — keeps API key server-side only.

const SYSTEM_PROMPT = `You are an AI assistant on Nathan Rubin's personal portfolio website (nathanrubin617.com). Your role is to help visitors learn about Nathan and his work.

ABOUT NATHAN:
Nathan Rubin is an author, student-athlete, youth speaker, and community builder from Boston, MA. He studies Economics, Community Relations, and Diaspora at UMass Boston, where he is also a collegiate basketball player. He connects storytelling, athletics, youth development, and community engagement to inspire young people.

HIS PUBLISHED CHILDREN'S BOOKS:
1. "Chasing a Dream" — Nathan's debut children's book teaches confidence, kindness, and self-belief, encouraging young readers to see the greatness within themselves. Available at local libraries, community centers, youth organizations, and Little Free Library locations. Purchase: https://www.amazon.com/dp/B0HKGRP94Z?spcref=PRINT_LISTING
2. "The Elephant’s Garden" — Nathan's newest children's book is a gentle story about emotions, resilience, and self-acceptance, showing that there is room for every part of who we are. Purchase: https://www.amazon.com/Elephants-Garden-Nathan-Rubin/dp/B0HLPT36TX?ref_=ast_author_dp_rw&th=1&psc=1&dib=eyJ2IjoiMSJ9.wFBwYv4dg6j9IQMrGnfH2o7gTHkiMhFGp8rUxfiIV9U.mzYJLqLqXtFqAsQZMTDT0scgntXM4w9-R4BeWx6xYyc&dib_tag=AUTHOR

COMMUNITY & YOUTH WORK:
Nathan conducts author readings at elementary schools (Mildred Ave K-8, Ellison Parks, Kilmer Elementary), runs youth storytelling and creativity workshops (such as the Young Dreamers Workshop in Dorchester), and speaks to teen programs (Level Ground Dorchester, Yonkers YMCA SNUG) about discipline, goals, and overcoming adversity.

BASKETBALL:
Nathan is a 2024 graduate of Lexington Christian Academy (EIL Champion, NEPSAC Champion). He plays collegiate basketball at UMass Boston.

CONTACT & BOOKINGS:
Email: nathanrubin2004@gmail.com | Phone: (617) 840-0068
Organizations and schools can invite Nathan for visits, readings, and speaking engagements via the Contact page.

BEHAVIOR:
Answer warmly about Nathan, his books, his youth speaking and community work, his basketball career, and how to contact him. If asked about unrelated topics, briefly acknowledge and redirect back to Nathan and what you can help with on this site. Keep responses concise and conversational.`;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export default async function (req) {
  // Handle OPTIONS preflight
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

  // Read API key from environment — never hardcoded, never exposed to client
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Parse request body — expects { messages: [{ role, content }] }
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

  // Map Anthropic-style messages to Gemini contents format.
  // Anthropic: { role: "user"|"assistant", content: "..." }
  // Gemini:    { role: "user"|"model",     parts: [{ text: "..." }] }
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Call Gemini generateContent API via raw fetch — no npm SDK required
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let geminiResponse;
  try {
    geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 500 }
      })
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reach Gemini API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text().catch(() => '');
    return new Response(JSON.stringify({ error: 'Gemini API error', detail: errText }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  // Extract reply from Gemini response shape: candidates[0].content.parts[0].text
  const data = await geminiResponse.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!reply) {
    return new Response(JSON.stringify({ error: 'No reply from Gemini' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
