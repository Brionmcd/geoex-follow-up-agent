import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FOLLOW_UP_AGENT_PROMPT } from '@/lib/agentPrompt';
import { sugatiConfig } from '@/lib/config/sugati';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Interface for email messages in conversation thread
interface EmailMessage {
  date: string;
  direction: 'inbound' | 'outbound';
  from: string;
  subject: string;
  body: string;
}

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
      conversationHistory,
      isVip,
      previousTrips,
    } = body;

    // Build conversation history section if provided
    let conversationSection = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const formattedThread = (conversationHistory as EmailMessage[])
        .map((msg) => {
          const direction = msg.direction === 'outbound' ? 'GeoEx sent' : 'Traveler replied';
          return `**${msg.date} — ${direction}**
From: ${msg.from}
Subject: ${msg.subject}

${msg.body}

---`;
        })
        .join('\n\n');

      conversationSection = `
## Conversation History

The following is the full email thread between GeoEx and this traveler. Read it carefully to understand:
- What has been discussed
- Any problems or blockers they mentioned
- Solutions offered
- Promises made (deadlines, accommodations)
- The traveler's tone and concerns

${formattedThread}

**Important:** Use this conversation context to write a follow-up that naturally continues the conversation. Don't repeat information they already know, and reference relevant past discussions.
`;
    }

    // Build VIP/repeat customer section
    let customerContext = '';
    if (isVip || previousTrips) {
      customerContext = `
## Customer Status
${isVip ? '- **VIP Customer**' : ''}
${previousTrips ? `- **Previous trips with GeoEx:** ${previousTrips}` : ''}
${isVip && previousTrips ? 'This is a valued repeat customer. Their silence is unusual and worth noting.' : ''}
`;
    }

    // Build the user prompt with traveler details
    const userPrompt = `Please analyze this traveler situation and decide on the best follow-up approach.

## Traveler Details
- **Name:** ${travelerName}
- **Email:** ${email}
- **Days until departure:** ${daysUntilDeparture}
- **Number of previous follow-ups sent:** ${previousFollowUps}
${customerContext}
## Missing Items
${missingItems.length > 0 ? missingItems.map((item: string) => `- ${item}`).join('\n') : '- None'}

## Additional Notes
${additionalNotes || 'No additional notes provided.'}
${conversationSection}
Based on this information${conversationHistory?.length ? ' and the conversation history' : ''}, please provide your recommendation in the specified JSON format.${conversationHistory?.length ? ' Make sure to include conversation_understanding and context_usage in your response.' : ''}`;

    // Call Claude API with increased token limit for conversation context
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048, // Increased for conversation context analysis
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
