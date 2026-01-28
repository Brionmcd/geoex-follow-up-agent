export interface SampleResponse {
  id: string;
  category: 'positive' | 'clarification' | 'accommodation' | 'frustrated' | 'problems' | 'ambiguous';
  label: string;
  text: string;
}

export const sampleResponses: SampleResponse[] = [
  // POSITIVE/COMPLIANT
  {
    id: 'pos1',
    category: 'positive',
    label: 'Will send tonight',
    text: "Got it, I'll send the passport scan tonight after work.",
  },
  {
    id: 'pos2',
    category: 'positive',
    label: 'Already uploaded',
    text: "Done! Just uploaded everything through the portal. Let me know if you need anything else.",
  },
  {
    id: 'pos3',
    category: 'positive',
    label: 'Quick confirmation',
    text: "👍",
  },
  {
    id: 'pos4',
    category: 'positive',
    label: 'On it',
    text: "Thanks for the reminder! I'll get this done by end of day tomorrow.",
  },

  // NEEDS CLARIFICATION
  {
    id: 'clar1',
    category: 'clarification',
    label: 'Missing form',
    text: "What medical form? I don't think I received that one. Can you resend?",
  },
  {
    id: 'clar2',
    category: 'clarification',
    label: 'Already submitted?',
    text: "I'm confused - I thought I already submitted my passport when I booked. Do I need to do it again?",
  },
  {
    id: 'clar3',
    category: 'clarification',
    label: 'Email bounced',
    text: "Which email address should I send it to? I tried replying to the automated message but it bounced.",
  },

  // REQUESTING ACCOMMODATION
  {
    id: 'accom1',
    category: 'accommodation',
    label: 'Scanner broken',
    text: "My scanner is broken and I won't be able to get to a FedEx until the weekend. Is there another way I can submit this?",
  },
  {
    id: 'accom2',
    category: 'accommodation',
    label: 'Extension request',
    text: "Would it be possible to extend the deadline by a few days? We're traveling for a family emergency and won't be home until Thursday.",
  },
  {
    id: 'accom3',
    category: 'accommodation',
    label: 'Spouse handling',
    text: "Can my husband submit the forms for both of us? He handles all our travel paperwork.",
  },

  // FRUSTRATION/ESCALATION NEEDED
  {
    id: 'frust1',
    category: 'frustrated',
    label: 'Third email complaint',
    text: "This is the third email about this. I already told Sarah I would send it when I get back from my business trip on the 15th. Please stop emailing me about it.",
  },
  {
    id: 'frust2',
    category: 'frustrated',
    label: 'Wants phone call',
    text: "I'm honestly getting a bit overwhelmed with all these forms. Is there someone I can talk to on the phone to walk through what's actually needed?",
  },
  {
    id: 'frust3',
    category: 'frustrated',
    label: 'Questioning requirements',
    text: "I don't understand why you need all this medical information. This feels excessive for a vacation. What happens if I don't fill it out?",
  },

  // POTENTIAL PROBLEMS
  {
    id: 'prob1',
    category: 'problems',
    label: 'Considering cancellation',
    text: "We've been talking it over and we're not sure we can make this trip work anymore. What are our options for postponing or getting a refund?",
  },
  {
    id: 'prob2',
    category: 'problems',
    label: 'Passport expiration',
    text: "I just realized my passport expires 4 months after the trip. Is that going to be a problem?",
  },
  {
    id: 'prob3',
    category: 'problems',
    label: 'Doctor won\'t sign',
    text: "My doctor won't sign the medical form because she says she can't verify I'm fit for 'high altitude trekking' - she's never done that before. What should I do?",
  },

  // AMBIGUOUS/UNCLEAR
  {
    id: 'amb1',
    category: 'ambiguous',
    label: 'Just "Ok"',
    text: "Ok",
  },
  {
    id: 'amb2',
    category: 'ambiguous',
    label: 'Checking with spouse',
    text: "Let me check with my wife and get back to you",
  },
  {
    id: 'amb3',
    category: 'ambiguous',
    label: 'Working on it',
    text: "We're working on it",
  },
];

export const categoryLabels: Record<SampleResponse['category'], string> = {
  positive: 'Positive',
  clarification: 'Needs Clarification',
  accommodation: 'Requesting Accommodation',
  frustrated: 'Frustrated',
  problems: 'Potential Problems',
  ambiguous: 'Ambiguous',
};

export const categoryColors: Record<SampleResponse['category'], string> = {
  positive: 'bg-green-100 text-green-800 border-green-200',
  clarification: 'bg-blue-100 text-blue-800 border-blue-200',
  accommodation: 'bg-amber-100 text-amber-800 border-amber-200',
  frustrated: 'bg-red-100 text-red-800 border-red-200',
  problems: 'bg-red-100 text-red-800 border-red-200',
  ambiguous: 'bg-gray-100 text-gray-800 border-gray-200',
};
