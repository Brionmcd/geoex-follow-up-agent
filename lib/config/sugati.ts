// Sugati/Salesforce Configuration
// Sugati is built on Salesforce, so we use Salesforce REST API

export const sugatiConfig = {
  // Set to true to use real Salesforce API, false for mock data
  // Control via environment variable or hardcode for testing
  useLiveData: process.env.USE_LIVE_SALESFORCE === 'true',

  // Salesforce instance URL (set via environment variable)
  instanceUrl:
    process.env.SALESFORCE_INSTANCE_URL || 'https://geoex--sandbox.sandbox.my.salesforce.com',

  // API version
  apiVersion: 'v59.0',

  // OAuth credentials (set via environment variables)
  clientId: process.env.SALESFORCE_CLIENT_ID || '',
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',

  // For sandbox testing
  isSandbox: process.env.SALESFORCE_IS_SANDBOX !== 'false', // default to true for safety
};

// Object API names (these may need adjustment based on GeoEx's actual Sugati setup)
export const sugatiObjects = {
  traveler: 'Contact', // or could be custom 'Traveler__c'
  trip: 'Trip__c', // Sugati custom object
  booking: 'Booking__c',
  task: 'Task',
  document: 'ContentDocument',
  emailMessage: 'EmailMessage',
};

// Field mappings (map our app fields to Salesforce field names)
// These will need to be adjusted based on GeoEx's actual Sugati schema
export const fieldMappings = {
  traveler: {
    id: 'Id',
    name: 'Name',
    firstName: 'FirstName',
    lastName: 'LastName',
    email: 'Email',
    phone: 'Phone',
    passportNumber: 'Passport_Number__c',
    passportExpiry: 'Passport_Expiry__c',
    medicalFormStatus: 'Medical_Form_Status__c',
    waiverStatus: 'Waiver_Status__c',
    dietaryRequirements: 'Dietary_Requirements__c',
    emergencyContact: 'Emergency_Contact__c',
    isVip: 'VIP__c',
    previousTrips: 'Previous_Trips__c',
    followUpCount: 'Follow_Up_Count__c',
    lastContactDate: 'Last_Contact_Date__c',
    notes: 'Notes__c',
  },
  trip: {
    id: 'Id',
    name: 'Name',
    departureDate: 'Departure_Date__c',
    destination: 'Destination__c',
    status: 'Status__c',
    totalTravelers: 'Total_Travelers__c',
    typicalCompletion: 'Typical_Completion_Rate__c',
  },
  booking: {
    id: 'Id',
    traveler: 'Contact__c',
    trip: 'Trip__c',
    status: 'Status__c',
    partySize: 'Party_Size__c',
  },
};

// Helper to check if we're in mock mode
export const isMockMode = () => !sugatiConfig.useLiveData;

// Helper to get display text for data source
export const getDataSourceLabel = () =>
  sugatiConfig.useLiveData ? 'Connected to Sugati' : 'Using Sample Data';
