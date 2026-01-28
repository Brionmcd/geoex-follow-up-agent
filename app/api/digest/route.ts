import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { DIGEST_AGENT_PROMPT } from '@/lib/digestAgentPrompt';
import { Traveler } from '@/lib/sampleTravelers';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { travelers } = body as { travelers: Traveler[] };

    // Build the user prompt with all traveler details
    const travelersList = travelers.map((t, index) => `
### Traveler ${index + 1}: ${t.name}
- **ID:** ${t.id}
- **Email:** ${t.email}
- **Trip:** ${t.tripName}
- **Days until departure:** ${t.daysUntilDeparture}
- **Previous follow-up contacts:** ${t.previousContacts}
- **Missing items:** ${t.missingItems.length > 0 ? t.missingItems.join(', ') : 'None (file complete)'}
- **Notes:** ${t.notes || 'No additional notes'}
`).join('\n');

    const userPrompt = `Please evaluate the following ${travelers.length} travelers and create a prioritized daily action list.

${travelersList}

Analyze each traveler, assign priorities, generate draft messages where appropriate, and return the results in the specified JSON format. Remember to sort by priority and then by departure date.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: DIGEST_AGENT_PROMPT,
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

    // Find JSON in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Merge the AI results with the original traveler data
    const enrichedTravelers = result.travelers.map((aiResult: {
      id: string;
      priority: string;
      shouldFollowUp: boolean;
      urgency: string;
      channel: string;
      reasoning: string;
      message: { subject: string; body: string } | null;
    }) => {
      const originalTraveler = travelers.find(t => t.id === aiResult.id);
      return {
        ...originalTraveler,
        ...aiResult,
      };
    });

    return NextResponse.json({
      travelers: enrichedTravelers,
      summary: result.summary,
    });
  } catch (error) {
    console.error('Error generating digest:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
