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
  // CRITICAL CASES
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

  // NEEDS ATTENTION CASES
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
    id: "t007",
    name: "Michael O'Brien",
    email: "mobrien@university.edu",
    tripName: "New Zealand Adventure",
    daysUntilDeparture: 18,
    previousContacts: 2,
    missingItems: ["Passport scan"],
    notes: "Professor, currently on sabbatical. Passport renewal in progress."
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
    id: "t009",
    name: "James & Carol Wilson",
    email: "wilsons@retirement.net",
    tripName: "Galápagos Islands",
    daysUntilDeparture: 25,
    previousContacts: 1,
    missingItems: ["Medical form", "Signed waiver"],
    notes: "Retired couple, celebrating 40th anniversary. Carol has mobility considerations."
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

  // CAN WAIT CASES
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
    id: "t012",
    name: "Susan Lee",
    email: "susanlee@gmail.com",
    tripName: "Norway Fjords",
    daysUntilDeparture: 42,
    previousContacts: 1,
    missingItems: ["Emergency contact", "Dietary preferences"],
    notes: "Repeat customer - third trip with GeoEx. Always submits on time."
  },
  {
    id: "t013",
    name: "Thomas Anderson",
    email: "t.anderson@matrix.com",
    tripName: "Egypt Pyramids",
    daysUntilDeparture: 45,
    previousContacts: 0,
    missingItems: ["Medical form"],
    notes: "Recently booked. Said he'd complete forms this weekend."
  },
  {
    id: "t014",
    name: "Rachel Green",
    email: "rachel.green@fashion.com",
    tripName: "Italian Riviera",
    daysUntilDeparture: 52,
    previousContacts: 0,
    missingItems: ["Dietary preferences"],
    notes: "Only minor item missing. Mentioned she's vegetarian in booking notes."
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

  // COMPLETE (should be filtered out)
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
  {
    id: "t017",
    name: "Christopher Davis",
    email: "cdavis@business.com",
    tripName: "Australian Outback",
    daysUntilDeparture: 30,
    previousContacts: 1,
    missingItems: [],
    notes: "Completed everything after first reminder. Repeat customer."
  },
  {
    id: "t018",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    tripName: "Amazon Rainforest",
    daysUntilDeparture: 15,
    previousContacts: 0,
    missingItems: [],
    notes: "Proactively submitted all documents at booking. First-timer but very organized."
  },
];
