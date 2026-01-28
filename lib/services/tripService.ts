// Trip Service
// Fetches trip data from Sugati/Salesforce or mock data
// Used primarily for anomaly detection and aggregate reporting

import { sugatiConfig, sugatiObjects, fieldMappings } from '../config/sugati';
import { salesforceService } from './salesforce';
import { trips, travelers, Trip as SampleTrip, Traveler as SampleTraveler } from '../sampleData';

// Trip interface used throughout the app
export interface Trip {
  id: string;
  name: string;
  departureDate: string;
  destination?: string;
  status?: string;
  totalTravelers: number;
  typicalCompletionAtThisStage: number;
  actualCompletion?: number;
}

// Extended trip data for anomaly detection
export interface TripWithTravelers extends Trip {
  travelers: SampleTraveler[];
}

// Map sample trip to our Trip interface
function mapSampleTrip(sample: SampleTrip): Trip {
  return {
    id: sample.id,
    name: sample.name,
    departureDate: sample.departureDate,
    totalTravelers: sample.totalTravelers,
    typicalCompletionAtThisStage: sample.typicalCompletionAtThisStage,
  };
}

class TripService {
  // Get all active trips
  async getActiveTrips(): Promise<Trip[]> {
    if (!sugatiConfig.useLiveData) {
      console.log('[TripService] Using mock data - getActiveTrips');
      await new Promise((resolve) => setTimeout(resolve, 200));
      return trips.map(mapSampleTrip);
    }

    const fields = fieldMappings.trip;
    const soql = `
      SELECT ${fields.id}, ${fields.name}, ${fields.departureDate},
             ${fields.destination}, ${fields.status}, ${fields.totalTravelers},
             ${fields.typicalCompletion}
      FROM ${sugatiObjects.trip}
      WHERE ${fields.departureDate} >= TODAY
      ORDER BY ${fields.departureDate} ASC
    `;

    const result = await salesforceService.query(soql);
    return this.mapSalesforceRecordsToTrips(result.records);
  }

  // Get trip by ID
  async getTripById(tripId: string): Promise<Trip | null> {
    if (!sugatiConfig.useLiveData) {
      console.log(`[TripService] Using mock data - getTripById: ${tripId}`);
      const trip = trips.find((t) => t.id === tripId);
      return trip ? mapSampleTrip(trip) : null;
    }

    const record = await salesforceService.getRecord(sugatiObjects.trip, tripId);
    if (!record) return null;
    return this.mapSalesforceRecordToTrip(record as Record<string, unknown>);
  }

  // Get all data needed for anomaly detection
  async getAnomalyDetectionData(): Promise<{
    trips: TripWithTravelers[];
    travelers: SampleTraveler[];
    summary: {
      totalTrips: number;
      totalTravelers: number;
      travelersWithMissingItems: number;
      travelersComplete: number;
    };
  }> {
    if (!sugatiConfig.useLiveData) {
      console.log('[TripService] Using mock data - getAnomalyDetectionData');
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Calculate actual completion for each trip
      const tripsWithTravelers = trips.map((trip) => {
        const tripTravelers = travelers.filter((t) => t.tripId === trip.id);
        const completeTravelers = tripTravelers.filter((t) => t.missingItems.length === 0);
        const actualCompletion =
          tripTravelers.length > 0 ? completeTravelers.length / tripTravelers.length : 0;

        return {
          ...mapSampleTrip(trip),
          actualCompletion,
          travelers: tripTravelers,
        };
      });

      return {
        trips: tripsWithTravelers,
        travelers,
        summary: {
          totalTrips: trips.length,
          totalTravelers: travelers.length,
          travelersWithMissingItems: travelers.filter((t) => t.missingItems.length > 0).length,
          travelersComplete: travelers.filter((t) => t.missingItems.length === 0).length,
        },
      };
    }

    // For real data, we'd need to query both trips and travelers
    // and compute the aggregates
    const tripsResult = await this.getActiveTrips();

    // Get all travelers for these trips
    const travelerFields = fieldMappings.traveler;
    const tripIds = tripsResult.map((t) => `'${t.id}'`).join(',');

    const travelersQuery = `
      SELECT ${travelerFields.id}, ${travelerFields.name}, ${travelerFields.email},
             Trip__c, Trip__r.Name, Trip__r.Departure_Date__c,
             ${travelerFields.passportNumber}, ${travelerFields.medicalFormStatus},
             ${travelerFields.waiverStatus}, ${travelerFields.emergencyContact},
             ${travelerFields.isVip}, ${travelerFields.previousTrips},
             ${travelerFields.followUpCount}, ${travelerFields.lastContactDate}
      FROM ${sugatiObjects.traveler}
      WHERE Trip__c IN (${tripIds})
    `;

    const travelersResult = await salesforceService.query(travelersQuery);
    const allTravelers = this.mapSalesforceRecordsToTravelers(travelersResult.records);

    // Group travelers by trip
    const tripsWithTravelers = tripsResult.map((trip) => {
      const tripTravelers = allTravelers.filter((t) => t.tripId === trip.id);
      const completeTravelers = tripTravelers.filter((t) => t.missingItems.length === 0);
      const actualCompletion =
        tripTravelers.length > 0 ? completeTravelers.length / tripTravelers.length : 0;

      return {
        ...trip,
        actualCompletion,
        travelers: tripTravelers as unknown as SampleTraveler[],
      };
    });

    return {
      trips: tripsWithTravelers,
      travelers: allTravelers as unknown as SampleTraveler[],
      summary: {
        totalTrips: tripsResult.length,
        totalTravelers: allTravelers.length,
        travelersWithMissingItems: allTravelers.filter((t) => t.missingItems.length > 0).length,
        travelersComplete: allTravelers.filter((t) => t.missingItems.length === 0).length,
      },
    };
  }

  // Calculate trip completion percentage
  async calculateTripCompletion(tripId: string): Promise<number> {
    if (!sugatiConfig.useLiveData) {
      const tripTravelers = travelers.filter((t) => t.tripId === tripId);
      if (tripTravelers.length === 0) return 0;
      const complete = tripTravelers.filter((t) => t.missingItems.length === 0);
      return complete.length / tripTravelers.length;
    }

    // Query for completion stats
    const soql = `
      SELECT COUNT(Id) total,
             SUM(CASE WHEN Passport_Number__c != null
                      AND Medical_Form_Status__c = true
                      AND Waiver_Status__c = true
                 THEN 1 ELSE 0 END) complete
      FROM ${sugatiObjects.traveler}
      WHERE Trip__c = '${tripId}'
    `;

    const result = await salesforceService.query(soql);
    if (result.records.length === 0) return 0;

    const record = result.records[0] as Record<string, number>;
    return record.total > 0 ? record.complete / record.total : 0;
  }

  // Map Salesforce records to Trip interface
  private mapSalesforceRecordsToTrips(records: Record<string, unknown>[]): Trip[] {
    return records.map((record) => this.mapSalesforceRecordToTrip(record));
  }

  private mapSalesforceRecordToTrip(record: Record<string, unknown>): Trip {
    return {
      id: record['Id'] as string,
      name: record['Name'] as string,
      departureDate: record['Departure_Date__c'] as string,
      destination: record['Destination__c'] as string,
      status: record['Status__c'] as string,
      totalTravelers: (record['Total_Travelers__c'] as number) || 0,
      typicalCompletionAtThisStage: (record['Typical_Completion_Rate__c'] as number) || 0.65,
    };
  }

  // Map Salesforce traveler records (for anomaly detection)
  private mapSalesforceRecordsToTravelers(
    records: Record<string, unknown>[]
  ): Array<{
    id: string;
    name: string;
    email: string;
    tripId: string;
    tripName: string;
    missingItems: string[];
    previousContacts: number;
    isVip: boolean;
    previousTrips: number;
  }> {
    return records.map((record) => {
      const tripRecord = record['Trip__r'] as Record<string, unknown> | undefined;
      return {
        id: record['Id'] as string,
        name: record['Name'] as string,
        email: record['Email'] as string,
        tripId: (record['Trip__c'] as string) || '',
        tripName: (tripRecord?.['Name'] as string) || 'Unknown Trip',
        missingItems: this.calculateMissingItems(record),
        previousContacts: (record['Follow_Up_Count__c'] as number) || 0,
        isVip: (record['VIP__c'] as boolean) || false,
        previousTrips: (record['Previous_Trips__c'] as number) || 0,
      };
    });
  }

  private calculateMissingItems(record: Record<string, unknown>): string[] {
    const missing: string[] = [];
    if (!record['Passport_Number__c']) missing.push('passport');
    if (!record['Medical_Form_Status__c']) missing.push('medical');
    if (!record['Waiver_Status__c']) missing.push('waiver');
    if (!record['Emergency_Contact__c']) missing.push('emergency_contact');
    return missing;
  }
}

// Export singleton instance
export const tripService = new TripService();
