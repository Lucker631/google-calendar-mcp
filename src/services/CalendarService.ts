// src/services/CalendarService.ts
import { google, calendar_v3 } from 'googleapis';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
// console.log('Environment loaded, Calendar ID:', process.env.GOOGLE_CALENDAR_ID);

// Define service account interface
interface ServiceAccount {
  client_email: string;
  private_key: string;
  [key: string]: any;
}

// Define event interface
interface CalendarEvent {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: calendar_v3.Schema$EventDateTime | null;
  end?: calendar_v3.Schema$EventDateTime | null;
  location?: string | null;
  htmlLink?: string | null;
  status?: string | null;
}

export class CalendarService {
  private static instance: CalendarService;
  private calendar: calendar_v3.Calendar;
  private calendarId: string;

  private constructor() {
    try {
      // Get the current file directory
      const __dirname = dirname(fileURLToPath(import.meta.url));
      // console.log('Current directory:', __dirname);
      
      // Resolve the service account file path
      const keyPath = join(__dirname, '../../service-account.json');
      // console.log('Service account path:', keyPath);
      
      // Read and parse the service account file
      let serviceAccount: ServiceAccount;
      try {
        const serviceAccountFile = readFileSync(keyPath, 'utf8');
        serviceAccount = JSON.parse(serviceAccountFile);
        console.log('Service account loaded successfully');
        console.log('Service account email:', serviceAccount.client_email);
      } catch (fileError: any) {
        console.error('Failed to read service account file:', fileError);
        throw new Error(`Could not read service account file: ${fileError.message}`);
      }
      
      // Get the calendar ID from environment variables
      this.calendarId = process.env.GOOGLE_CALENDAR_ID || '';
      
      if (!this.calendarId) {
        console.error('GOOGLE_CALENDAR_ID is not defined in environment variables');
        throw new Error('GOOGLE_CALENDAR_ID is not defined in environment variables');
      }
      
      console.log('Using Calendar ID:', this.calendarId);

      // Create JWT auth client
      const auth = new google.auth.JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      });

      // Initialize calendar API
      this.calendar = google.calendar({ version: 'v3', auth });
      console.log('Google Calendar API initialized successfully');
      
      // Test API connection
      this.testConnection();
      
    } catch (error: any) {
      console.error('Error initializing CalendarService:', error);
      throw error;
    }
  }

  /**
   * Test the connection to the Google Calendar API
   */
  private async testConnection(): Promise<void> {
    try {
      const response = await this.calendar.calendarList.get({
        calendarId: this.calendarId
      });
      console.log('Calendar API connection test successful');
      console.log('Calendar details:', response.data.summary);
    } catch (error: any) {
      console.error('Calendar API connection test failed:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  }

  /**
   * Get the singleton instance of CalendarService
   */
  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      try {
        CalendarService.instance = new CalendarService();
      } catch (error: any) {
        console.error('Failed to create CalendarService instance:', error);
        throw error;
      }
    }
    return CalendarService.instance;
  }

  /**
   * Get events for today
   */
  public async getTodayEvents(): Promise<CalendarEvent[]> {
    console.log('Getting today\'s events');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    console.log(`Time range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    return this.getEvents(startOfDay, endOfDay);
  }

  /**
   * Get events for the next 7 days
   */
  public async getWeekEvents(): Promise<CalendarEvent[]> {
    console.log('Getting week events');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59);
    console.log(`Time range: ${startOfDay.toISOString()} to ${endOfWeek.toISOString()}`);

    return this.getEvents(startOfDay, endOfWeek);
  }

  /**
   * Get events for a specific time range
   */
  private async getEvents(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
    try {
      console.log(`Fetching events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);
      console.log(`Using calendar ID: ${this.calendarId}`);
      
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      console.log(`API response status: ${response.status}`);
      console.log(`Events found: ${response.data.items?.length || 0}`);
      
      if (response.data.items && response.data.items.length > 0) {
        console.log('First event summary:', response.data.items[0].summary);
      }
      
      return response.data.items?.map(event => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        htmlLink: event.htmlLink,
        status: event.status
      })) || [];
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
      } else if (error.request) {
        console.error('Error request (no response received):', error.request);
      } else {
        console.error('Error message:', error.message || 'Unknown error');
      }
      
      // Re-throw the error so the resource can return an appropriate error response
      throw error;
    }
  }
}