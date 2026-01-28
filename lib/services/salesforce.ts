// Salesforce API Service
// Handles authentication and API calls to Sugati/Salesforce

import { sugatiConfig } from '../config/sugati';

interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  token_type: string;
  expires_in: number;
}

interface SalesforceQueryResponse {
  totalSize: number;
  done: boolean;
  records: Record<string, unknown>[];
}

interface SalesforceCreateResponse {
  id: string;
  success: boolean;
  errors: string[];
}

class SalesforceService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  // Get base URL for API calls
  private get baseUrl() {
    return `${sugatiConfig.instanceUrl}/services/data/${sugatiConfig.apiVersion}`;
  }

  // Check if token is valid
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    return new Date() < this.tokenExpiry;
  }

  // Authenticate with Salesforce (OAuth 2.0 Client Credentials flow)
  async authenticate(): Promise<boolean> {
    if (!sugatiConfig.useLiveData) {
      console.log('[Salesforce] Mock mode - skipping authentication');
      return true;
    }

    // Return true if we already have a valid token
    if (this.isTokenValid()) {
      console.log('[Salesforce] Using existing valid token');
      return true;
    }

    try {
      console.log('[Salesforce] Authenticating with Salesforce...');

      const tokenUrl = sugatiConfig.isSandbox
        ? 'https://test.salesforce.com/services/oauth2/token'
        : 'https://login.salesforce.com/services/oauth2/token';

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: sugatiConfig.clientId,
          client_secret: sugatiConfig.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const data: SalesforceAuthResponse = await response.json();
      this.accessToken = data.access_token;
      // Set expiry to 1 hour from now (Salesforce tokens typically last 2 hours)
      this.tokenExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000);

      console.log('[Salesforce] Authentication successful');
      return true;
    } catch (error) {
      console.error('[Salesforce] Authentication error:', error);
      return false;
    }
  }

  // Ensure we're authenticated before making API calls
  private async ensureAuthenticated(): Promise<void> {
    if (!this.isTokenValid()) {
      const success = await this.authenticate();
      if (!success) {
        throw new Error('Failed to authenticate with Salesforce');
      }
    }
  }

  // Execute SOQL query
  async query(soql: string): Promise<SalesforceQueryResponse> {
    if (!sugatiConfig.useLiveData) {
      console.log('[Salesforce] Mock mode - would execute query:', soql);
      return { records: [], totalSize: 0, done: true };
    }

    await this.ensureAuthenticated();

    const url = `${this.baseUrl}/query?q=${encodeURIComponent(soql)}`;
    console.log('[Salesforce] Executing query:', soql);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Query failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Salesforce] Query returned ${result.totalSize} records`);
    return result;
  }

  // Get a single record by ID
  async getRecord(objectName: string, recordId: string, fields?: string[]): Promise<unknown> {
    if (!sugatiConfig.useLiveData) {
      console.log(`[Salesforce] Mock mode - would get ${objectName}/${recordId}`);
      return null;
    }

    await this.ensureAuthenticated();

    let url = `${this.baseUrl}/sobjects/${objectName}/${recordId}`;
    if (fields && fields.length > 0) {
      url += `?fields=${fields.join(',')}`;
    }

    console.log(`[Salesforce] Getting record: ${objectName}/${recordId}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get record failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Update a record
  async updateRecord(
    objectName: string,
    recordId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    if (!sugatiConfig.useLiveData) {
      console.log(`[Salesforce] Mock mode - would update ${objectName}/${recordId}:`, data);
      return true;
    }

    await this.ensureAuthenticated();

    const url = `${this.baseUrl}/sobjects/${objectName}/${recordId}`;
    console.log(`[Salesforce] Updating record: ${objectName}/${recordId}`);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Salesforce] Update failed: ${response.status} - ${errorText}`);
      return false;
    }

    console.log('[Salesforce] Record updated successfully');
    return true;
  }

  // Create a new record
  async createRecord(
    objectName: string,
    data: Record<string, unknown>
  ): Promise<string | null> {
    if (!sugatiConfig.useLiveData) {
      console.log(`[Salesforce] Mock mode - would create ${objectName}:`, data);
      return `mock-${objectName.toLowerCase()}-${Date.now()}`;
    }

    await this.ensureAuthenticated();

    const url = `${this.baseUrl}/sobjects/${objectName}`;
    console.log(`[Salesforce] Creating record: ${objectName}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Salesforce] Create failed: ${response.status} - ${errorText}`);
      return null;
    }

    const result: SalesforceCreateResponse = await response.json();
    console.log(`[Salesforce] Record created: ${result.id}`);
    return result.id;
  }

  // Create a task (common operation for logging follow-ups)
  async createTask(data: {
    subject: string;
    description: string;
    whoId: string; // Contact ID
    whatId?: string; // Related record (Trip)
    activityDate: string;
    priority: 'High' | 'Normal' | 'Low';
    status?: string;
  }): Promise<string | null> {
    const taskData = {
      Subject: data.subject,
      Description: data.description,
      WhoId: data.whoId,
      WhatId: data.whatId,
      ActivityDate: data.activityDate,
      Priority: data.priority,
      Status: data.status || 'Not Started',
    };

    return this.createRecord('Task', taskData);
  }

  // Log an email activity
  async logEmailActivity(data: {
    contactId: string;
    subject: string;
    body: string;
    direction: 'inbound' | 'outbound';
  }): Promise<string | null> {
    const taskData = {
      Subject: `Email: ${data.subject}`,
      Description: data.body,
      WhoId: data.contactId,
      ActivityDate: new Date().toISOString().split('T')[0],
      Priority: 'Normal' as const,
      Status: 'Completed',
      Type: 'Email',
    };

    return this.createRecord('Task', taskData);
  }
}

// Export singleton instance
export const salesforceService = new SalesforceService();
