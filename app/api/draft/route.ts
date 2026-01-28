import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DRAFT_PROMPT = `You are a GeoEx travel coordinator writing a follow-up email to a traveler with incomplete documentation.

Write a personalized, warm email that:
- Addresses them by name
- Mentions their specific trip
- Lists exactly what documents are missing
- Provides clear next steps
- Matches the tone to their situation

Tone guidelines based on previous contacts:
- 0 contacts: Warm, helpful, excited about their upcoming trip
- 1-2 contacts: Still friendly, acknowledge they're busy, make it easy
- 3+ contacts: More direct, express genuine concern, offer phone call

Special considerations:
- VIP clients: Extra courteous
- First-time travelers: More explanation about why items are needed
- Repeat customers: More casual, reference their experience
- Honor any preferences mentioned in notes (e.g., "prefers text", "best after 6pm")

Return ONLY valid JSON in this format:
{
  "subject": "Email subject line",
  "body": "Full email message"
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      tripName,
      daysUntilDeparture,
      previousContacts,
      missingItems,
      notes,
      channel,
    } = body;

    const userPrompt = `Write a follow-up ${channel === 'phone' ? 'email requesting a phone call' : 'email'} for this traveler:

- Name: ${name}
- Email: ${email}
- Trip: ${tripName}
- Days until departure: ${daysUntilDeparture}
- Previous follow-up attempts: ${previousContacts}
- Missing items: ${missingItems.join(', ')}
- Notes: ${notes || 'None'}

Generate the email now.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: DRAFT_PROMPT,
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

    const responseText = textContent.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating draft:', error);

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
