import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ANOMALY_AGENT_PROMPT } from '@/lib/anomalyAgentPrompt';
import { tripService } from '@/lib/services/tripService';
import { sugatiConfig } from '@/lib/config/sugati';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST() {
  try {
    // Log data source
    console.log(
      `[Anomalies API] Using ${sugatiConfig.useLiveData ? 'Sugati/Salesforce' : 'sample'} data`
    );

    // Get all the data for anomaly detection via the service layer
    const data = await tripService.getAnomalyDetectionData();

    const userPrompt = `Analyze this traveler and trip data to detect anomalies, patterns, and outliers that need attention.

## Trip Data

${JSON.stringify(data.trips, null, 2)}

## Summary Statistics

- Total trips: ${data.summary.totalTrips}
- Total travelers: ${data.summary.totalTravelers}
- Travelers with missing items: ${data.summary.travelersWithMissingItems}
- Travelers complete: ${data.summary.travelersComplete}

## Today's Date

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (use this to calculate days until departure)

## Your Task

1. Scan all the data for anomalies
2. Look for patterns across travelers (same issue affecting multiple people)
3. Check for behavior changes (VIPs acting unusual)
4. Find statistical outliers (trips behind expected completion)
5. Spot timing anomalies (multiple events clustered in time)
6. Notice data inconsistencies (numbers that don't add up)

Return your findings as JSON.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: ANOMALY_AGENT_PROMPT,
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
    console.error('Error detecting anomalies:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
