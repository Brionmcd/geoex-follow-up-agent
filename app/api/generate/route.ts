import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FOLLOW_UP_AGENT_PROMPT } from '@/lib/agentPrompt';
import { sugatiConfig } from '@/lib/config/sugati';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Log data source
    console.log(
      `[Generate API] Using ${sugatiConfig.useLiveData ? 'Sugati/Salesforce' : 'sample'} data`
    );

    const body = await request.json();

    const {
      travelerName,
      email,
      daysUntilDeparture,
      previousFollowUps,
      missingItems,
      additionalNotes,
    } = body;

    // Build the user prompt with traveler details
    const userPrompt = `Please analyze this traveler situation and decide on the best follow-up approach.

## Traveler Details
- **Name:** ${travelerName}
- **Email:** ${email}
- **Days until departure:** ${daysUntilDeparture}
- **Number of previous follow-ups sent:** ${previousFollowUps}

## Missing Items
${missingItems.length > 0 ? missingItems.map((item: string) => `- ${item}`).join('\n') : '- None'}

## Additional Notes
${additionalNotes || 'No additional notes provided.'}

Based on this information, please provide your recommendation in the specified JSON format.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: FOLLOW_UP_AGENT_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract the text content from the response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Parse the JSON response from Claude
    const responseText = textContent.text;

    // Find JSON in the response (Claude might include extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating follow-up:', error);

    // Return a helpful error message
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
