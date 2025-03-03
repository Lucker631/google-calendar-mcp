import { google, calendar_v3 } from 'googleapis';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  attendees: Array<{email: string; responseStatus?: string}>;
  organizer?: {email: string; displayName?: string};
  status: string;
}

export class CalendarService {
  private static instance: CalendarService;
  
  private constructor() {}

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  private async getAuthenticatedClient() {
    try {
      console.error('Authenticating with service account...');
      const keyFile = JSON.parse(fs.readFileSync('service-account.json', 'utf-8'));
      console.error(`Service account email: ${keyFile.client_email}`);
      
      const jwtClient = new google.auth.JWT(
        keyFile.client_email,
        undefined,
        keyFile.private_key,
        ['https://www.googleapis.com/auth/calendar.readonly']
      );
      
      console.error('Calling authorize()...');
      await jwtClient.authorize();
      console.error('Authentication successful');
      
      return jwtClient;
    } catch (err) {
      console.error('Error authenticating with service account:', err);
      throw err;
    }
  }

  async getTodayEvents(): Promise<CalendarEvent[]> {
    try {
      const auth = await this.getAuthenticatedClient();
      console.error('Creating calendar client...');
      const calendar = google.calendar({ version: 'v3', auth });
      
      // Calculate today's time range
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      const timeMin = startOfDay.toISOString();
      const timeMax = endOfDay.toISOString();
      console.error(`Time range: ${timeMin} to ${timeMax}`);
      
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      console.error(`Using calendar ID: ${calendarId}`);
      
      console.error('Fetching events from Google Calendar API...');
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      console.error(`Retrieved ${response.data.items?.length || 0} events`);
      return (response.data.items || []).map(event => ({
        id: event.id!,
        summary: event.summary!,
        description: event.description || undefined,
        location: event.location || undefined,
        start: event.start?.dateTime || event.start?.date!,
        end: event.end?.dateTime || event.end?.date!,
        attendees: (event.attendees || []).map(attendee => ({
          email: attendee.email!,
          responseStatus: attendee.responseStatus || undefined
        })),
        organizer: event.organizer ? {
          email: event.organizer.email!,
          displayName: event.organizer.displayName || undefined
        } : undefined,
        status: event.status!
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getWeekEvents(): Promise<CalendarEvent[]> {
    try {
      const auth = await this.getAuthenticatedClient();
      console.error('Creating calendar client...');
      const calendar = google.calendar({ version: 'v3', auth });

      // Calculate the time range for a week ahead (starting from today)
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7); // 7 days from today

      const timeMin = startOfWeek.toISOString();
      const timeMax = endOfWeek.toISOString();
      console.error(`Time range: ${timeMin} to ${timeMax}`);

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      console.error(`Using calendar ID: ${calendarId}`);

      console.error('Fetching events from Google Calendar API...');
      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.error(`Retrieved ${response.data.items?.length || 0} events`);
      return (response.data.items || []).map(event => ({
        id: event.id!,
        summary: event.summary!,
        description: event.description || undefined,
        location: event.location || undefined,
        start: event.start?.dateTime || event.start?.date!,
        end: event.end?.dateTime || event.end?.date!,
        attendees: (event.attendees || []).map(attendee => ({
          email: attendee.email!,
          responseStatus: attendee.responseStatus || undefined
        })),
        organizer: event.organizer ? {
          email: event.organizer.email!,
          displayName: event.organizer.displayName || undefined
        } : undefined,
        status: event.status!
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }
}