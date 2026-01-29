import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TRIP_HEALTH_AGENT_PROMPT } from '@/lib/tripHealthAgentPrompt';
import { Trip } from '@/lib/sampleTrips';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trips: Trip[] = body.trips;

    if (!trips || trips.length === 0) {
      return NextResponse.json({ error: 'No trips provided' }, { status: 400 });
    }

    // Build the user prompt with all trip details
    const tripsList = trips
      .map(
        (trip, index) => `
### Trip ${index + 1}: ${trip.name}
- **ID:** ${trip.id}
- **Destination:** ${trip.destination}
- **Departure Date:** ${trip.departureDate}
- **Days Until Departure:** ${trip.daysUntilDeparture}
- **Total Travelers:** ${trip.totalTravelers}
- **Trip Leader:** ${trip.tripLeader || 'Not assigned'}

**Completion Metrics:**
- Actual Completion Rate: ${Math.round(trip.completionRate * 100)}%
- Expected Completion Rate: ${Math.round(trip.expectedCompletionRate * 100)}%
- Difference: ${trip.completionRate >= trip.expectedCompletionRate ? '+' : ''}${Math.round((trip.completionRate - trip.expectedCompletionRate) * 100)}%
- Response Rate: ${Math.round(trip.responseRate * 100)}%
- Documents Collected: ${trip.documentsCollected} of ${trip.documentsRequired}

**Travelers:**
${trip.travelers
  .map(
    (t) =>
      `  - ${t.name}: ${t.status}${t.missingItems.length > 0 ? ` (missing: ${t.missingItems.join(', ')})` : ''}${t.lastContact ? ` | Last contact: ${t.lastContact}` : ''}${t.responded !== null ? ` | Responded: ${t.responded ? 'Yes' : 'No'}` : ''}${t.partySize ? ` | Party of ${t.partySize}` : ''}${t.passportsSubmitted ? ` | ${t.passportsSubmitted} passports submitted` : ''}`
  )
  .join('\n')}

**Notes:** ${trip.notes || 'None'}
`
      )
      .join('\n---\n');

    const userPrompt = `Please analyze the following ${trips.length} upcoming trips and provide health assessments for each.

Today's date is ${new Date().toISOString().split('T')[0]}.

${tripsList}

Analyze each trip's readiness, identify concerns and patterns, predict trajectories, and provide actionable recommendations. Return results sorted by priority (critical first, then at-risk, then healthy).`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: TRIP_HEALTH_AGENT_PROMPT,
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

    // Merge AI results with original trip data for enrichment
    const enrichedTrips = result.trips.map(
      (aiTrip: {
        tripId: string;
        tripName: string;
        status: string;
        readiness: {
          actual: number;
          expected: number;
          difference: number;
          differenceLabel: string;
        };
        trajectory: {
          prediction: string;
          confidence: string;
        };
        concerns: string[];
        positives: string[];
        assessment: string;
        recommendations: string[];
        hasAnomalies: boolean;
        anomalyHint?: string;
      }) => {
        const originalTrip = trips.find((t) => t.id === aiTrip.tripId);
        return {
          ...originalTrip,
          ...aiTrip,
        };
      }
    );

    return NextResponse.json({
      summary: result.summary,
      trips: enrichedTrips,
    });
  } catch (error) {
    console.error('Error analyzing trips:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
