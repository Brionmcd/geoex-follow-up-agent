// Sample conversation data for demonstrating conversation continuity
// These represent realistic email threads between GeoEx and travelers

export interface EmailMessage {
  date: string;
  direction: 'inbound' | 'outbound';
  from: string;
  subject: string;
  body: string;
}

export interface TravelerConversation {
  travelerId: string;
  travelerName: string;
  travelerEmail: string;
  tripName: string;
  tripId?: string;
  daysUntilDeparture: number;
  missingItems: string[];
  thread: EmailMessage[];
  daysSinceLastMessage: number;
  lastMessageDirection: 'inbound' | 'outbound';
  isVip?: boolean;
  previousTrips?: number;
  notes?: string;
}

export const sampleConversations: TravelerConversation[] = [
  // Conversation 1: Scanner Problem (Resolved Blocker)
  {
    travelerId: 'sarah-chen',
    travelerName: 'Sarah Chen',
    travelerEmail: 'sarah.chen@email.com',
    tripName: 'Patagonia Trek',
    daysUntilDeparture: 18,
    missingItems: ['Passport scan'],
    thread: [
      {
        date: '2025-01-15',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Reminder: Passport scan needed for your Patagonia trip',
        body: `Hi Sarah,

Just a friendly reminder that we still need a scan of your passport for your upcoming Patagonia Trek. Could you send that over when you get a chance?

Thanks!
Emily`,
      },
      {
        date: '2025-01-18',
        direction: 'inbound',
        from: 'Sarah Chen',
        subject: 'Re: Reminder: Passport scan needed',
        body: `Hi Emily,

Sorry for the delay! My scanner is actually broken and I won't be able to get to FedEx until the weekend. Is there another way I can submit this? Could I just take a photo with my phone?

Thanks,
Sarah`,
      },
      {
        date: '2025-01-18',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Re: Reminder: Passport scan needed',
        body: `Hi Sarah,

Absolutely! A clear phone photo works perfectly. Just make sure:
- All four corners of the passport are visible
- The text is readable (good lighting helps)
- The photo isn't blurry

Just reply to this email with the photo attached, or upload it through your traveler portal.

Let me know if you have any questions!
Emily`,
      },
    ],
    daysSinceLastMessage: 10,
    lastMessageDirection: 'outbound',
  },

  // Conversation 2: Concerned About Altitude
  {
    travelerId: 'david-wilson',
    travelerName: 'David Wilson',
    travelerEmail: 'david.wilson@email.com',
    tripName: 'Peru Explorer',
    daysUntilDeparture: 25,
    missingItems: ['Medical form'],
    thread: [
      {
        date: '2025-01-10',
        direction: 'inbound',
        from: 'David Wilson',
        subject: 'Question about the trip',
        body: `Hi,

I'm really excited about the Peru trip but I have to admit I'm a bit nervous about the altitude. I've never been above 8,000 feet before. Will I be okay? Should I be doing anything to prepare?

Thanks,
David`,
      },
      {
        date: '2025-01-10',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Re: Question about the trip',
        body: `Hi David,

Great question, and it's totally normal to have some altitude concerns! Here's what I'd recommend:

1. Stay well hydrated in the weeks before (and during) the trip
2. Consider asking your doctor about Diamox as a preventive
3. We build in acclimatization time in the itinerary
4. Avoid alcohol the first day or two at altitude

Most of our travelers do great with these precautions. The guides are also trained to recognize altitude issues early.

Let me know if you have other questions!
Mark`,
      },
      {
        date: '2025-01-15',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Medical form for your Peru trip',
        body: `Hi David,

Hope you're doing well! Just a reminder that we need your completed medical form for the Peru Explorer trip. You can download it here and have your doctor sign off.

Thanks!
Mark`,
      },
    ],
    daysSinceLastMessage: 13,
    lastMessageDirection: 'outbound',
    notes: 'Previously expressed concern about altitude. May need reassurance connecting medical form to his concerns.',
  },

  // Conversation 3: Frustrated Repeat Customer (VIP)
  {
    travelerId: 'robert-kim',
    travelerName: 'Robert Kim',
    travelerEmail: 'robert.kim@email.com',
    tripName: 'Iceland Explorer',
    daysUntilDeparture: 14,
    missingItems: ['Passport scan', 'Emergency contact'],
    isVip: true,
    previousTrips: 5,
    thread: [
      {
        date: '2025-01-08',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Documents needed for Iceland Explorer',
        body: `Hi Robert,

Excited to have you joining us for another adventure! When you get a chance, we'll need your passport scan and emergency contact info for the Iceland trip.

Thanks!
Jennifer`,
      },
      {
        date: '2025-01-15',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Reminder: Documents for Iceland',
        body: `Hi Robert,

Just a quick reminder about the passport scan and emergency contact for your Iceland trip. Let me know if you have any questions!

Thanks,
Jennifer`,
      },
      {
        date: '2025-01-22',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Following up: Iceland documents',
        body: `Hi Robert,

Wanted to follow up on the documents for Iceland. We're getting closer to departure and want to make sure everything is set. Could you send over your passport scan and emergency contact when you have a moment?

Thanks!
Jennifer`,
      },
    ],
    daysSinceLastMessage: 6,
    lastMessageDirection: 'outbound',
    notes: 'VIP customer with 5 previous trips. Usually very responsive. No replies to any of the 3 emails — this is unusual for him.',
  },

  // Conversation 4: Deadline Extension Granted (Now Passed)
  {
    travelerId: 'maria-garcia',
    travelerName: 'Maria Garcia',
    travelerEmail: 'maria.garcia@email.com',
    tripName: 'Morocco Discovery',
    daysUntilDeparture: 21,
    missingItems: ['Medical form', 'Signed waiver'],
    thread: [
      {
        date: '2025-01-12',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Documents needed for Morocco Discovery',
        body: `Hi Maria,

We're getting excited for your Morocco trip! We still need a couple of items:
- Medical history form (doctor signature required)
- Signed activity waiver

Could you send these over by January 20th?

Thanks!
Alex`,
      },
      {
        date: '2025-01-14',
        direction: 'inbound',
        from: 'Maria Garcia',
        subject: 'Re: Documents needed for Morocco',
        body: `Hi Alex,

I'm so sorry but I'm traveling for a family emergency and won't be home until Thursday the 23rd. Is there any way to extend the deadline? I promise I'll get everything sent as soon as I'm back.

Thank you for understanding,
Maria`,
      },
      {
        date: '2025-01-14',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Re: Documents needed for Morocco',
        body: `Hi Maria,

Of course, no problem at all. I hope everything is okay with your family.

Let's extend the deadline to Friday, January 24th. Just send the documents over when you're settled back home.

Safe travels, and let me know if you need anything else.

Best,
Alex`,
      },
    ],
    daysSinceLastMessage: 14,
    lastMessageDirection: 'outbound',
    notes: 'Deadline was extended to Jan 24 due to family emergency. Today is Jan 28 — the extended deadline has passed by 4 days.',
  },

  // Conversation 5: Quick Positive Response (Already Handled?)
  {
    travelerId: 'tom-anderson',
    travelerName: 'Tom Anderson',
    travelerEmail: 'tom.anderson@email.com',
    tripName: 'Tanzania Safari',
    daysUntilDeparture: 30,
    missingItems: ['Dietary preferences'],
    thread: [
      {
        date: '2025-01-25',
        direction: 'outbound',
        from: 'GeoEx',
        subject: 'Quick question: Dietary preferences',
        body: `Hi Tom,

Looking forward to your Tanzania Safari! One quick thing — could you let us know about any dietary preferences or restrictions? This helps our lodges prepare.

Thanks!
Sam`,
      },
      {
        date: '2025-01-25',
        direction: 'inbound',
        from: 'Tom Anderson',
        subject: 'Re: Quick question: Dietary preferences',
        body: `No restrictions, I'll eat anything! Thanks for checking.

- Tom`,
      },
    ],
    daysSinceLastMessage: 3,
    lastMessageDirection: 'inbound',
    notes: 'Already responded positively. This item should probably be marked complete in the system — no follow-up needed.',
  },
];

// Helper function to get a conversation by traveler ID
export const getConversationById = (travelerId: string): TravelerConversation | undefined => {
  return sampleConversations.find((c) => c.travelerId === travelerId);
};

// Helper function to format a date for display
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper function to get thread duration
export const getThreadDuration = (thread: EmailMessage[]): number => {
  if (thread.length < 2) return 0;
  const firstDate = new Date(thread[0].date);
  const lastDate = new Date(thread[thread.length - 1].date);
  return Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
};

// Helper function to truncate message body for preview
export const truncateBody = (body: string, maxLength: number = 120): string => {
  // Get first line or first part of body
  const firstLine = body.split('\n').find((line) => line.trim().length > 0) || '';
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength).trim() + '...';
};
