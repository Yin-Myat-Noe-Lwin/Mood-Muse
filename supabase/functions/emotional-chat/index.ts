import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mood, context } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Received chat request:', { message, mood, context });

    const systemInstruction = `You are an empathetic emotional support AI assistant. Your role is to provide compassionate, understanding, and helpful responses to users who may be experiencing various emotional states.

${mood ? `The user's current mood is: ${mood}` : ''}
${context ? `Additional context: ${context}` : ''}

Guidelines:
- Be warm, empathetic, and non-judgmental
- Provide emotional validation and support
- Offer practical coping strategies when appropriate
- Encourage professional help if the situation seems serious
- Keep responses conversational and supportive
- Avoid giving medical advice
- Focus on emotional support and understanding`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          parts: [{ text: message }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Gemini API key configuration.');
      } else {
        throw new Error(`Gemini API error: ${response.status}`);
      }
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    console.log('Generated reply:', reply);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in emotional-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});