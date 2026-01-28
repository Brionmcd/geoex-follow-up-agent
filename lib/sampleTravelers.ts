export interface Traveler {
  id: string;
  name: string;
  email: string;
  tripName: string;
  daysUntilDeparture: number;
  previousContacts: number;
  missingItems: string[];
  notes: string;
}

export const sampleTravelers: Traveler[] = [
  // CRITICAL CASES (4)
  {
    id: "t001",
    name: "Marcus Chen",
    email: "marcus.chen@email.com",
    tripName: "Patagonia Explorer",
    daysUntilDeparture: 3,
    previousContacts: 3,
    missingItems: ["Passport scan", "Medical form"],
    notes: "Has been unresponsive to emails. Phone number on file."
  },
  {
    id: "t002",
    name: "Sarah Mitchell",
    email: "sarah.m@company.com",
    tripName: "Iceland Northern Lights",
    daysUntilDeparture: 5,
    previousContacts: 2,
    missingItems: ["Signed waiver"],
    notes: "Mentioned she's been traveling for work. Prefers text messages."
  },
  {
    id: "t003",
    name: "David & Lisa Park",
    email: "parkfamily@gmail.com",
    tripName: "Japan Cherry Blossom",
    daysUntilDeparture: 6,
    previousContacts: 4,
    missingItems: ["Medical form", "Emergency contact"],
    notes: "Traveling as a couple. Lisa handles logistics. Multiple follow-ups with no response."
  },
  {
    id: "t004",
    name: "Jennifer Walsh",
    email: "jwalsh@lawfirm.com",
    tripName: "Morocco Discovery",
    daysUntilDeparture: 7,
    previousContacts: 2,
    missingItems: ["Passport scan", "Signed waiver"],
    notes: "Attorney, very busy schedule. Best reached after 6pm."
  },

  // NEEDS ATTENTION CASES (4)
  {
    id: "t005",
    name: "Robert Thompson",
    email: "rob.thompson@email.com",
    tripName: "Tanzania Safari",
    daysUntilDeparture: 12,
    previousContacts: 1,
    missingItems: ["Medical form", "Dietary preferences"],
    notes: "First-time GeoEx traveler. Very excited about the trip."
  },
  {
    id: "t006",
    name: "Emily Rodriguez",
    email: "emily.r@startup.io",
    tripName: "Peru Machu Picchu",
    daysUntilDeparture: 14,
    previousContacts: 1,
    missingItems: ["Emergency contact"],
    notes: "Repeat customer - did Patagonia trip last year. Knows the process."
  },
  {
    id: "t008",
    name: "Amanda Foster",
    email: "afoster@design.co",
    tripName: "Vietnam Expedition",
    daysUntilDeparture: 21,
    previousContacts: 0,
    missingItems: ["Passport scan", "Medical form"],
    notes: "First-time international traveler. May need extra guidance."
  },
  {
    id: "t010",
    name: "Priya Sharma",
    email: "priya.sharma@tech.com",
    tripName: "Bhutan Kingdom",
    daysUntilDeparture: 28,
    previousContacts: 1,
    missingItems: ["Passport scan"],
    notes: "VIP client - CEO of tech company. Personal assistant handles communications."
  },

  // CAN WAIT CASES (2)
  {
    id: "t011",
    name: "Kevin Martinez",
    email: "kevin.m@email.com",
    tripName: "Costa Rica Rainforest",
    daysUntilDeparture: 35,
    previousContacts: 0,
    missingItems: ["Dietary preferences"],
    notes: "Just booked last week. Plenty of time."
  },
  {
    id: "t015",
    name: "Daniel Kim",
    email: "dkim@finance.com",
    tripName: "Scottish Highlands",
    daysUntilDeparture: 60,
    previousContacts: 0,
    missingItems: ["Passport scan", "Medical form", "Signed waiver"],
    notes: "Trip is far out. Just booked, will have time to complete everything."
  },

  // COMPLETE - should be filtered out (1)
  {
    id: "t016",
    name: "Laura Bennett",
    email: "laura.b@email.com",
    tripName: "Greek Islands",
    daysUntilDeparture: 20,
    previousContacts: 2,
    missingItems: [],
    notes: "All documents complete. Ready to go!"
  },
];
