// Sample data for GeoEx agents - includes anomalies for detection

export interface Trip {
  id: string;
  name: string;
  departureDate: string;
  totalTravelers: number;
  typicalCompletionAtThisStage: number; // percentage as decimal (0.70 = 70%)
}

export interface Traveler {
  id: string;
  name: string;
  tripId: string;
  tripName: string;
  email: string;
  missingItems: string[];
  previousContacts: number;
  daysSinceLastContact: number | null;
  lastResponseDaysAgo: number | null;
  isVip?: boolean;
  previousTrips?: number;
  typicalResponseTime?: string;
  notes?: string;
  lastEmailSent?: string;
  lastResponse?: string | null;
  partySize?: number;
  passportsSubmitted?: number;
  emergencyContacts?: number;
}

// Trips data
export const trips: Trip[] = [
  {
    id: "trip-1",
    name: "Tanzania Safari",
    departureDate: "2025-03-15",
    totalTravelers: 6,
    typicalCompletionAtThisStage: 0.70, // 70% is normal at this stage
  },
  {
    id: "trip-2",
    name: "Patagonia Trek",
    departureDate: "2025-02-20",
    totalTravelers: 8,
    typicalCompletionAtThisStage: 0.65,
  },
  {
    id: "trip-3",
    name: "Iceland Explorer",
    departureDate: "2025-04-10",
    totalTravelers: 4,
    typicalCompletionAtThisStage: 0.50,
  },
  {
    id: "trip-4",
    name: "Morocco Discovery",
    departureDate: "2025-03-01",
    totalTravelers: 10,
    typicalCompletionAtThisStage: 0.80,
  },
];

// Travelers data with planted anomalies
export const travelers: Traveler[] = [
  // ===== TANZANIA SAFARI (trip-1) =====
  // ANOMALY 1: 4 of 6 travelers missing the SAME form (medical)
  {
    id: "t1",
    name: "James Smith",
    tripId: "trip-1",
    tripName: "Tanzania Safari",
    email: "james.smith@email.com",
    missingItems: ["medical"],
    previousContacts: 1,
    daysSinceLastContact: 5,
    lastResponseDaysAgo: 3,
  },
  {
    id: "t2",
    name: "Maria Garcia",
    tripId: "trip-1",
    tripName: "Tanzania Safari",
    email: "maria.garcia@email.com",
    missingItems: ["medical"],
    previousContacts: 1,
    daysSinceLastContact: 5,
    lastResponseDaysAgo: 4,
  },
  {
    id: "t3",
    name: "Raj Patel",
    tripId: "trip-1",
    tripName: "Tanzania Safari",
    email: "raj.patel@email.com",
    missingItems: ["medical", "waiver"],
    previousContacts: 2,
    daysSinceLastContact: 7,
    lastResponseDaysAgo: 6,
  },
  {
    id: "t4",
    name: "Susan Williams",
    tripId: "trip-1",
    tripName: "Tanzania Safari",
    email: "susan.williams@email.com",
    missingItems: ["medical"],
    previousContacts: 1,
    daysSinceLastContact: 4,
    lastResponseDaysAgo: 2,
  },
  {
    id: "t5",
    name: "Tom Anderson",
    tripId: "trip-1",
    tripName: "Tanzania Safari",
    email: "tom.anderson@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
  {
    id: "t6",
    name: "Lisa Chen",
    tripId: "trip-1",
    tripName: "Tanzania Safari",
    email: "lisa.chen@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },

  // ===== PATAGONIA TREK (trip-2) =====
  // ANOMALY 2: VIP behavior change - Robert Kim
  // ANOMALY 3: Trip is behind schedule (only ~25% complete vs expected 65%)
  {
    id: "t7",
    name: "Robert Kim",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "robert.kim@email.com",
    missingItems: ["passport", "medical"],
    previousContacts: 3,
    daysSinceLastContact: 14,
    lastResponseDaysAgo: null, // no response at all
    isVip: true,
    previousTrips: 5,
    typicalResponseTime: "24 hours",
    notes: "VIP repeat customer, usually very responsive",
  },
  {
    id: "t8",
    name: "Jennifer Lee",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "jennifer.lee@email.com",
    missingItems: ["passport", "emergency contact", "waiver"],
    previousContacts: 2,
    daysSinceLastContact: 10,
    lastResponseDaysAgo: 8,
  },
  {
    id: "t9",
    name: "Michael Brown",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "michael.brown@email.com",
    missingItems: ["medical", "waiver"],
    previousContacts: 1,
    daysSinceLastContact: 6,
    lastResponseDaysAgo: 5,
  },
  {
    id: "t10",
    name: "Sarah Johnson",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "sarah.johnson@email.com",
    missingItems: ["passport"],
    previousContacts: 2,
    daysSinceLastContact: 8,
    lastResponseDaysAgo: 7,
  },
  {
    id: "t11",
    name: "David Wilson",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "david.wilson@email.com",
    missingItems: ["emergency contact"],
    previousContacts: 1,
    daysSinceLastContact: 4,
    lastResponseDaysAgo: 3,
  },
  {
    id: "t12",
    name: "Emily Davis",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "emily.davis@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
  {
    id: "t13",
    name: "Chris Martinez",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "chris.martinez@email.com",
    missingItems: ["passport", "medical"],
    previousContacts: 2,
    daysSinceLastContact: 9,
    lastResponseDaysAgo: null,
  },
  {
    id: "t14",
    name: "Amanda Taylor",
    tripId: "trip-2",
    tripName: "Patagonia Trek",
    email: "amanda.taylor@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },

  // ===== ICELAND EXPLORER (trip-3) =====
  // ANOMALY 5: Data inconsistency - Henderson Family
  {
    id: "t15",
    name: "The Henderson Family",
    tripId: "trip-3",
    tripName: "Iceland Explorer",
    email: "hendersons@email.com",
    missingItems: ["passport", "medical"],
    previousContacts: 1,
    daysSinceLastContact: 3,
    lastResponseDaysAgo: 2,
    partySize: 4, // family of 4
    passportsSubmitted: 2, // only 2 passports
    emergencyContacts: 1, // only 1 emergency contact
    notes: "Booking for 4 travelers",
  },
  {
    id: "t16",
    name: "Kevin O'Brien",
    tripId: "trip-3",
    tripName: "Iceland Explorer",
    email: "kevin.obrien@email.com",
    missingItems: ["waiver"],
    previousContacts: 1,
    daysSinceLastContact: 5,
    lastResponseDaysAgo: 4,
  },
  {
    id: "t17",
    name: "Nina Petrov",
    tripId: "trip-3",
    tripName: "Iceland Explorer",
    email: "nina.petrov@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
  {
    id: "t18",
    name: "George Clark",
    tripId: "trip-3",
    tripName: "Iceland Explorer",
    email: "george.clark@email.com",
    missingItems: ["emergency contact"],
    previousContacts: 1,
    daysSinceLastContact: 2,
    lastResponseDaysAgo: 1,
  },

  // ===== MOROCCO DISCOVERY (trip-4) =====
  // ANOMALY 4: 3 travelers stopped responding after the same Jan 15 email
  {
    id: "t19",
    name: "Alex Thompson",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "alex.thompson@email.com",
    missingItems: ["passport", "medical"],
    previousContacts: 2,
    daysSinceLastContact: 13,
    lastResponseDaysAgo: null,
    lastEmailSent: "2025-01-15",
    lastResponse: null,
  },
  {
    id: "t20",
    name: "Beth Martinez",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "beth.martinez@email.com",
    missingItems: ["passport", "waiver"],
    previousContacts: 2,
    daysSinceLastContact: 13,
    lastResponseDaysAgo: null,
    lastEmailSent: "2025-01-15",
    lastResponse: null,
  },
  {
    id: "t21",
    name: "Carlos Rivera",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "carlos.rivera@email.com",
    missingItems: ["medical", "emergency contact"],
    previousContacts: 2,
    daysSinceLastContact: 13,
    lastResponseDaysAgo: null,
    lastEmailSent: "2025-01-15",
    lastResponse: null,
  },
  {
    id: "t22",
    name: "Diana Foster",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "diana.foster@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
  {
    id: "t23",
    name: "Edward Chang",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "edward.chang@email.com",
    missingItems: ["waiver"],
    previousContacts: 1,
    daysSinceLastContact: 3,
    lastResponseDaysAgo: 2,
  },
  {
    id: "t24",
    name: "Fiona Walsh",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "fiona.walsh@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
  {
    id: "t25",
    name: "Gregory Nguyen",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "gregory.nguyen@email.com",
    missingItems: ["passport"],
    previousContacts: 1,
    daysSinceLastContact: 4,
    lastResponseDaysAgo: 3,
  },
  {
    id: "t26",
    name: "Hannah Scott",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "hannah.scott@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
  {
    id: "t27",
    name: "Ivan Kozlov",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "ivan.kozlov@email.com",
    missingItems: ["emergency contact"],
    previousContacts: 1,
    daysSinceLastContact: 5,
    lastResponseDaysAgo: 4,
  },
  {
    id: "t28",
    name: "Julia Adams",
    tripId: "trip-4",
    tripName: "Morocco Discovery",
    email: "julia.adams@email.com",
    missingItems: [], // complete
    previousContacts: 0,
    daysSinceLastContact: null,
    lastResponseDaysAgo: null,
  },
];

// Helper function to get travelers for a specific trip
export const getTravelersByTrip = (tripId: string): Traveler[] => {
  return travelers.filter((t) => t.tripId === tripId);
};

// Helper function to calculate trip completion percentage
export const calculateTripCompletion = (tripId: string): number => {
  const tripTravelers = getTravelersByTrip(tripId);
  if (tripTravelers.length === 0) return 0;

  const completeTravelers = tripTravelers.filter((t) => t.missingItems.length === 0);
  return completeTravelers.length / tripTravelers.length;
};

// Helper function to get all data for anomaly detection
export const getAnomalyDetectionData = () => {
  return {
    trips: trips.map((trip) => ({
      ...trip,
      actualCompletion: calculateTripCompletion(trip.id),
      travelers: getTravelersByTrip(trip.id),
    })),
    travelers,
    summary: {
      totalTrips: trips.length,
      totalTravelers: travelers.length,
      travelersWithMissingItems: travelers.filter((t) => t.missingItems.length > 0).length,
      travelersComplete: travelers.filter((t) => t.missingItems.length === 0).length,
    },
  };
};
