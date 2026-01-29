// Sample trip data for the Trip Health Dashboard
// These represent realistic trips with varying health statuses

export interface TripTraveler {
  id: string;
  name: string;
  status: 'complete' | 'incomplete';
  missingItems: string[];
  lastContact?: string | null;
  lastContactEmail?: string;
  responded?: boolean | null;
  partySize?: number;
  passportsSubmitted?: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  departureDate: string;
  daysUntilDeparture: number;
  totalTravelers: number;
  travelers: TripTraveler[];
  completionRate: number;
  expectedCompletionRate: number;
  responseRate: number;
  documentsCollected: number;
  documentsRequired: number;
  tripLeader: string | null;
  notes: string;
}

export const sampleTrips: Trip[] = [
  {
    id: 'trip-1',
    name: 'Patagonia Trek',
    destination: 'Chile & Argentina',
    departureDate: '2025-02-20',
    daysUntilDeparture: 23,
    totalTravelers: 8,
    travelers: [
      {
        id: 't1',
        name: 'Sarah Chen',
        status: 'incomplete',
        missingItems: ['passport'],
        lastContact: '2025-01-18',
        responded: false,
      },
      {
        id: 't2',
        name: 'Michael Torres',
        status: 'incomplete',
        missingItems: ['passport', 'medical'],
        lastContact: '2025-01-22',
        responded: false,
      },
      {
        id: 't3',
        name: 'Jennifer Park',
        status: 'incomplete',
        missingItems: ['medical'],
        lastContact: '2025-01-20',
        responded: true,
      },
      {
        id: 't4',
        name: 'David Wilson',
        status: 'incomplete',
        missingItems: ['medical', 'waiver'],
        lastContact: '2025-01-15',
        responded: false,
      },
      {
        id: 't5',
        name: 'Emily Brown',
        status: 'incomplete',
        missingItems: ['emergency_contact'],
        lastContact: '2025-01-25',
        responded: true,
      },
      {
        id: 't6',
        name: 'James Lee',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't7',
        name: 'Anna Martinez',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't8',
        name: 'Chris Johnson',
        status: 'incomplete',
        missingItems: ['passport', 'medical', 'waiver'],
        lastContact: '2025-01-10',
        responded: false,
      },
    ],
    completionRate: 0.25, // 2 of 8 complete
    expectedCompletionRate: 0.75, // At 23 days out, should be ~75%
    responseRate: 0.33, // Of those contacted, 33% responded
    documentsCollected: 12,
    documentsRequired: 40,
    tripLeader: 'Sarah Chen',
    notes: 'Adventure-focused group, first-time GeoEx travelers mostly',
  },
  {
    id: 'trip-2',
    name: 'Tanzania Safari',
    destination: 'Tanzania',
    departureDate: '2025-03-15',
    daysUntilDeparture: 46,
    totalTravelers: 6,
    travelers: [
      {
        id: 't9',
        name: 'Robert Kim',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't10',
        name: 'Lisa Wang',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't11',
        name: 'Tom Anderson',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't12',
        name: 'Maria Garcia',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't13',
        name: 'John Smith',
        status: 'incomplete',
        missingItems: ['medical'],
        lastContact: '2025-01-24',
        responded: true,
      },
      {
        id: 't14',
        name: 'Susan Davis',
        status: 'incomplete',
        missingItems: ['medical'],
        lastContact: '2025-01-24',
        responded: true,
      },
    ],
    completionRate: 0.67, // 4 of 6 complete
    expectedCompletionRate: 0.5, // At 46 days out, 50% expected
    responseRate: 1.0, // Everyone contacted has responded
    documentsCollected: 24,
    documentsRequired: 30,
    tripLeader: 'Robert Kim',
    notes: "Repeat customers, VIP group, Robert's 5th trip",
  },
  {
    id: 'trip-3',
    name: 'Morocco Discovery',
    destination: 'Morocco',
    departureDate: '2025-03-01',
    daysUntilDeparture: 32,
    totalTravelers: 10,
    travelers: [
      {
        id: 't15',
        name: 'Alex Thompson',
        status: 'incomplete',
        missingItems: ['passport', 'medical'],
        lastContact: '2025-01-15',
        lastContactEmail: 'batch-jan-15',
        responded: false,
      },
      {
        id: 't16',
        name: 'Beth Martinez',
        status: 'incomplete',
        missingItems: ['passport', 'waiver'],
        lastContact: '2025-01-15',
        lastContactEmail: 'batch-jan-15',
        responded: false,
      },
      {
        id: 't17',
        name: 'Carlos Rivera',
        status: 'incomplete',
        missingItems: ['medical', 'waiver'],
        lastContact: '2025-01-15',
        lastContactEmail: 'batch-jan-15',
        responded: false,
      },
      {
        id: 't18',
        name: 'Diana Foster',
        status: 'incomplete',
        missingItems: ['passport', 'medical', 'waiver', 'emergency_contact'],
        lastContact: null,
        responded: null,
      },
      {
        id: 't19',
        name: 'Eric Nelson',
        status: 'incomplete',
        missingItems: ['passport', 'medical', 'waiver', 'dietary'],
        lastContact: null,
        responded: null,
      },
      {
        id: 't20',
        name: 'Fiona Clark',
        status: 'incomplete',
        missingItems: ['passport', 'medical'],
        lastContact: null,
        responded: null,
      },
      {
        id: 't21',
        name: 'George White',
        status: 'incomplete',
        missingItems: ['waiver'],
        lastContact: '2025-01-20',
        responded: true,
      },
      {
        id: 't22',
        name: 'Helen Brown',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't23',
        name: 'Ian Davis',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
      {
        id: 't24',
        name: 'Julia Wilson',
        status: 'complete',
        missingItems: [],
        lastContact: null,
        responded: null,
      },
    ],
    completionRate: 0.3, // 3 of 10 complete
    expectedCompletionRate: 0.7, // At 32 days out, 70% expected
    responseRate: 0.25, // Only 1 of 4 contacted responded
    documentsCollected: 18,
    documentsRequired: 50,
    tripLeader: null,
    notes: "Mixed group, some haven't engaged at all",
  },
  {
    id: 'trip-4',
    name: 'Iceland Explorer',
    destination: 'Iceland',
    departureDate: '2025-04-10',
    daysUntilDeparture: 72,
    totalTravelers: 4,
    travelers: [
      {
        id: 't25',
        name: 'The Henderson Family',
        status: 'incomplete',
        missingItems: ['passport', 'passport', 'medical', 'medical'],
        partySize: 4,
        passportsSubmitted: 2,
        lastContact: '2025-01-20',
        responded: true,
      },
    ],
    completionRate: 0.5, // 2 of 4 passports, some forms done
    expectedCompletionRate: 0.3, // At 72 days out, 30% is fine
    responseRate: 1.0,
    documentsCollected: 8,
    documentsRequired: 20,
    tripLeader: 'Henderson Family',
    notes: 'Family of 4 on one booking — may have confusion about who needs to submit what',
  },
  {
    id: 'trip-5',
    name: 'Japan Cultural',
    destination: 'Japan',
    departureDate: '2025-02-15',
    daysUntilDeparture: 18,
    totalTravelers: 12,
    travelers: [
      { id: 't26', name: 'Amanda Foster', status: 'complete', missingItems: [] },
      { id: 't27', name: 'Brian Chen', status: 'complete', missingItems: [] },
      { id: 't28', name: 'Catherine Lee', status: 'complete', missingItems: [] },
      { id: 't29', name: 'Derek Wang', status: 'complete', missingItems: [] },
      { id: 't30', name: 'Elena Rodriguez', status: 'complete', missingItems: [] },
      { id: 't31', name: 'Frank Miller', status: 'complete', missingItems: [] },
      { id: 't32', name: 'Grace Kim', status: 'complete', missingItems: [] },
      { id: 't33', name: 'Henry Zhang', status: 'complete', missingItems: [] },
      { id: 't34', name: 'Irene Park', status: 'complete', missingItems: [] },
      { id: 't35', name: 'Jason Liu', status: 'complete', missingItems: [] },
      {
        id: 't36',
        name: 'Nancy White',
        status: 'incomplete',
        missingItems: ['dietary'],
        lastContact: '2025-01-26',
        responded: true,
      },
      {
        id: 't37',
        name: 'Oscar Green',
        status: 'incomplete',
        missingItems: ['emergency_contact'],
        lastContact: '2025-01-26',
        responded: true,
      },
    ],
    completionRate: 0.83, // 10 of 12 complete
    expectedCompletionRate: 0.9, // At 18 days out, should be 90%
    responseRate: 1.0,
    documentsCollected: 56,
    documentsRequired: 60,
    tripLeader: 'Nancy White',
    notes: 'Almost there — just minor items remaining',
  },
];

// Helper function to get a trip by ID
export const getTripById = (tripId: string): Trip | undefined => {
  return sampleTrips.find((t) => t.id === tripId);
};

// Helper function to get incomplete travelers for a trip
export const getIncompleteTravelers = (trip: Trip): TripTraveler[] => {
  return trip.travelers.filter((t) => t.status === 'incomplete');
};

// Helper function to get non-responsive travelers
export const getNonResponsiveTravelers = (trip: Trip): TripTraveler[] => {
  return trip.travelers.filter((t) => t.lastContact && t.responded === false);
};

// Helper function to calculate health status based on data
export const calculateHealthStatus = (
  trip: Trip
): 'critical' | 'at_risk' | 'healthy' | 'complete' => {
  // 100% complete
  if (trip.completionRate === 1) {
    return 'complete';
  }

  const difference = trip.completionRate - trip.expectedCompletionRate;

  // Critical: >30% behind OR <14 days with <70% complete
  if (difference < -0.3 || (trip.daysUntilDeparture < 14 && trip.completionRate < 0.7)) {
    return 'critical';
  }

  // At Risk: 15-30% behind
  if (difference < -0.15) {
    return 'at_risk';
  }

  // Healthy: On track or ahead
  return 'healthy';
};

// Helper function to format the difference label
export const formatDifferenceLabel = (actual: number, expected: number): string => {
  const diff = actual - expected;
  const percentage = Math.abs(Math.round(diff * 100));

  if (diff >= 0) {
    return `${percentage}% ahead of expected`;
  } else {
    return `${percentage}% behind expected`;
  }
};
