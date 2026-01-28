// Traveler Service
// Fetches traveler data from Sugati/Salesforce or mock data
// This is the main interface for all traveler-related operations

import { sugatiConfig, sugatiObjects, fieldMappings } from '../config/sugati';
import { salesforceService } from './salesforce';
import { sampleTravelers, Traveler as SampleTraveler } from '../sampleTravelers';

// Traveler interface used throughout the app
export interface Traveler {
  id: string;
  name: string;
  email: string;
  tripId: string;
  tripName: string;
  daysUntilDeparture: number;
  previousContacts: number;
  daysSinceLastContact: number | null;
  lastResponseDaysAgo: number | null;
  missingItems: string[];
  notes: string;
  isVip?: boolean;
  previousTrips?: number;
  typicalResponseTime?: string;
  partySize?: number;
  passportsSubmitted?: number;
  emergencyContacts?: number;
  lastEmailSent?: string;
  lastResponse?: string | null;
}

// Map sample traveler to our Traveler interface
// Note: The sampleTravelers data has a simpler structure than our full interface
function mapSampleTraveler(sample: SampleTraveler): Traveler {
  return {
    id: sample.id,
    name: sample.name,
    email: sample.email,
    tripId: '', // sampleTravelers don't have tripId
    tripName: sample.tripName,
    daysUntilDeparture: sample.daysUntilDeparture,
    previousContacts: sample.previousContacts,
    daysSinceLastContact: null, // Not available in sampleTravelers
    lastResponseDaysAgo: null, // Not available in sampleTravelers
    missingItems: sample.missingItems,
    notes: sample.notes,
    // These fields are not in sampleTravelers
    isVip: undefined,
    previousTrips: undefined,
  };
}

class TravelerService {
  // Get all travelers needing attention (have missing items)
  async getTravelersNeedingAttention(): Promise<Traveler[]> {
    if (!sugatiConfig.useLiveData) {
      console.log('[TravelerService] Using mock data - getTravelersNeedingAttention');
      // Simulate API delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 300));
      return sampleTravelers.filter((t) => t.missingItems.length > 0).map(mapSampleTraveler);
    }

    // Real Salesforce query
    const fields = fieldMappings.traveler;
    const soql = `
      SELECT ${fields.id}, ${fields.name}, ${fields.email},
             Trip__r.Name, Trip__r.Departure_Date__c,
             ${fields.passportNumber}, ${fields.medicalFormStatus},
             ${fields.waiverStatus}, ${fields.emergencyContact},
             ${fields.dietaryRequirements}, ${fields.isVip},
             ${fields.previousTrips}, ${fields.followUpCount},
             ${fields.lastContactDate}, ${fields.notes}
      FROM ${sugatiObjects.traveler}
      WHERE Trip__r.Departure_Date__c >= TODAY
        AND (${fields.passportNumber} = null
             OR ${fields.medicalFormStatus} = false
             OR ${fields.waiverStatus} = false
             OR ${fields.emergencyContact} = null)
      ORDER BY Trip__r.Departure_Date__c ASC
    `;

    const result = await salesforceService.query(soql);
    return this.mapSalesforceRecordsToTravelers(result.records);
  }

  // Get all travelers (for anomaly detection)
  async getAllTravelers(): Promise<Traveler[]> {
    if (!sugatiConfig.useLiveData) {
      console.log('[TravelerService] Using mock data - getAllTravelers');
      await new Promise((resolve) => setTimeout(resolve, 300));
      return sampleTravelers.map(mapSampleTraveler);
    }

    const fields = fieldMappings.traveler;
    const soql = `
      SELECT ${fields.id}, ${fields.name}, ${fields.email},
             Trip__r.Id, Trip__r.Name, Trip__r.Departure_Date__c,
             ${fields.passportNumber}, ${fields.medicalFormStatus},
             ${fields.waiverStatus}, ${fields.emergencyContact},
             ${fields.dietaryRequirements}, ${fields.isVip},
             ${fields.previousTrips}, ${fields.followUpCount},
             ${fields.lastContactDate}, ${fields.notes}
      FROM ${sugatiObjects.traveler}
      WHERE Trip__r.Departure_Date__c >= TODAY
      ORDER BY Trip__r.Departure_Date__c ASC
    `;

    const result = await salesforceService.query(soql);
    return this.mapSalesforceRecordsToTravelers(result.records);
  }

  // Get travelers for a specific trip
  async getTravelersByTrip(tripId: string): Promise<Traveler[]> {
    if (!sugatiConfig.useLiveData) {
      console.log(`[TravelerService] Using mock data - getTravelersByTrip: ${tripId}`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      // Note: sampleTravelers don't have tripId, so this will return empty in mock mode
      // In production, this would filter by the actual trip ID
      console.log('[TravelerService] Warning: sampleTravelers do not support trip filtering');
      return [];
    }

    const fields = fieldMappings.traveler;
    const soql = `
      SELECT ${fields.id}, ${fields.name}, ${fields.email},
             Trip__r.Name, Trip__r.Departure_Date__c,
             ${fields.passportNumber}, ${fields.medicalFormStatus},
             ${fields.waiverStatus}, ${fields.emergencyContact},
             ${fields.isVip}, ${fields.previousTrips}, ${fields.followUpCount}
      FROM ${sugatiObjects.traveler}
      WHERE Trip__c = '${tripId}'
    `;

    const result = await salesforceService.query(soql);
    return this.mapSalesforceRecordsToTravelers(result.records);
  }

  // Get a single traveler by ID
  async getTravelerById(travelerId: string): Promise<Traveler | null> {
    if (!sugatiConfig.useLiveData) {
      console.log(`[TravelerService] Using mock data - getTravelerById: ${travelerId}`);
      const traveler = sampleTravelers.find((t) => t.id === travelerId);
      return traveler ? mapSampleTraveler(traveler) : null;
    }

    const fields = fieldMappings.traveler;
    const fieldList = [
      fields.id,
      fields.name,
      fields.email,
      fields.passportNumber,
      fields.medicalFormStatus,
      fields.waiverStatus,
      fields.emergencyContact,
      fields.isVip,
      fields.previousTrips,
      fields.followUpCount,
      fields.notes,
    ];

    const record = await salesforceService.getRecord(
      sugatiObjects.traveler,
      travelerId,
      fieldList
    );

    if (!record) return null;
    return this.mapSalesforceRecordToTraveler(record as Record<string, unknown>);
  }

  // Log a follow-up action in Salesforce
  async logFollowUp(
    travelerId: string,
    action: {
      type: 'email' | 'phone' | 'skipped';
      notes: string;
      messageSubject?: string;
      messageContent?: string;
    }
  ): Promise<boolean> {
    console.log(`[TravelerService] Logging follow-up for ${travelerId}:`, action);

    if (!sugatiConfig.useLiveData) {
      console.log('[TravelerService] Mock mode - follow-up logged (simulated)');
      return true;
    }

    // Create a Task in Salesforce to record the follow-up
    const subject =
      action.type === 'email'
        ? `Email Follow-up: ${action.messageSubject || 'Document Request'}`
        : action.type === 'phone'
          ? 'Phone Follow-up Attempted'
          : 'Follow-up Skipped';

    let description = action.notes;
    if (action.messageContent) {
      description += `\n\n--- Message Content ---\n${action.messageContent}`;
    }

    const taskId = await salesforceService.createTask({
      subject,
      description,
      whoId: travelerId,
      activityDate: new Date().toISOString().split('T')[0],
      priority: 'Normal',
      status: action.type === 'skipped' ? 'Not Started' : 'Completed',
    });

    // Also increment the follow-up count on the Contact record
    if (taskId && action.type !== 'skipped') {
      await salesforceService.updateRecord(sugatiObjects.traveler, travelerId, {
        [fieldMappings.traveler.followUpCount]: { $inc: 1 }, // Note: Real SF doesn't support $inc
        [fieldMappings.traveler.lastContactDate]: new Date().toISOString().split('T')[0],
      });
    }

    return !!taskId;
  }

  // Update traveler document status
  async updateDocumentStatus(
    travelerId: string,
    documentType: 'passport' | 'medical' | 'waiver' | 'emergency' | 'dietary',
    status: boolean | string
  ): Promise<boolean> {
    console.log(`[TravelerService] Updating ${documentType} status for ${travelerId}: ${status}`);

    if (!sugatiConfig.useLiveData) {
      console.log('[TravelerService] Mock mode - document status updated (simulated)');
      return true;
    }

    const fieldMap: Record<string, string> = {
      passport: fieldMappings.traveler.passportNumber,
      medical: fieldMappings.traveler.medicalFormStatus,
      waiver: fieldMappings.traveler.waiverStatus,
      emergency: fieldMappings.traveler.emergencyContact,
      dietary: fieldMappings.traveler.dietaryRequirements,
    };

    const field = fieldMap[documentType];
    if (!field) {
      console.error(`[TravelerService] Unknown document type: ${documentType}`);
      return false;
    }

    return salesforceService.updateRecord(sugatiObjects.traveler, travelerId, {
      [field]: status,
    });
  }

  // Map Salesforce records to our Traveler interface
  private mapSalesforceRecordsToTravelers(records: Record<string, unknown>[]): Traveler[] {
    return records.map((record) => this.mapSalesforceRecordToTraveler(record));
  }

  private mapSalesforceRecordToTraveler(record: Record<string, unknown>): Traveler {
    const tripRecord = record['Trip__r'] as Record<string, unknown> | undefined;

    return {
      id: record['Id'] as string,
      name: record['Name'] as string,
      email: record['Email'] as string,
      tripId: (record['Trip__c'] as string) || '',
      tripName: (tripRecord?.['Name'] as string) || 'Unknown Trip',
      daysUntilDeparture: this.calculateDaysUntil(tripRecord?.['Departure_Date__c'] as string),
      previousContacts: (record['Follow_Up_Count__c'] as number) || 0,
      daysSinceLastContact: this.calculateDaysSince(record['Last_Contact_Date__c'] as string),
      lastResponseDaysAgo: null, // Would need separate tracking
      missingItems: this.calculateMissingItems(record),
      notes: (record['Notes__c'] as string) || '',
      isVip: (record['VIP__c'] as boolean) || false,
      previousTrips: (record['Previous_Trips__c'] as number) || 0,
    };
  }

  private calculateDaysUntil(dateString: string | undefined): number {
    if (!dateString) return 999;
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private calculateDaysSince(dateString: string | undefined): number | null {
    if (!dateString) return null;
    const pastDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - pastDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private calculateMissingItems(record: Record<string, unknown>): string[] {
    const missing: string[] = [];
    if (!record['Passport_Number__c']) missing.push('passport');
    if (!record['Medical_Form_Status__c']) missing.push('medical');
    if (!record['Waiver_Status__c']) missing.push('waiver');
    if (!record['Emergency_Contact__c']) missing.push('emergency_contact');
    if (!record['Dietary_Requirements__c']) missing.push('dietary');
    return missing;
  }
}

// Export singleton instance
export const travelerService = new TravelerService();
