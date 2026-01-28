import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { INTERPRET_AGENT_PROMPT } from '@/lib/interpretAgentPrompt';
import { sugatiConfig } from '@/lib/config/sugati';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Log data source
    console.log(
      `[Interpret API] Using ${sugatiConfig.useLiveData ? 'Sugati/Salesforce' : 'sample'} data`
    );

    const body = await request.json();
    const { responseText, travelerName, requestedItems, previousContacts, additionalContext } =
      body;

    if (!responseText || responseText.trim() === '') {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 });
    }

    // Build context section
    let contextSection = '';
    if (travelerName || requestedItems?.length || previousContacts || additionalContext) {
      contextSection = '\n\nContext provided:';
      if (travelerName) {
        contextSection += `\n- Traveler name: ${travelerName}`;
      }
      if (requestedItems?.length) {
        contextSection += `\n- We asked them for: ${requestedItems.join(', ')}`;
      }
      if (previousContacts) {
        contextSection += `\n- Number of previous follow-ups: ${previousContacts}`;
      }
      if (additionalContext) {
        contextSection += `\n- Additional context: ${additionalContext}`;
      }
    }

    const userPrompt = `Interpret this email response from a traveler:

---
${responseText}
---
${contextSection}

Analyze this response and provide your interpretation.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: INTERPRET_AGENT_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    const responseTextFromAI = textContent.text;
    const jsonMatch = responseTextFromAI.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error interpreting response:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
