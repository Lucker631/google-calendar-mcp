import { MCPResource } from "mcp-framework";
import { CalendarService } from "../services/CalendarService.js";

class TodayCalendarResource extends MCPResource {
  uri = "resource://today-calendar";
  name = "Today's Calendar Events";
  description = "Returns events scheduled for today from Google Calendar";
  mimeType = "application/json";

  async read() {
    try {
      const calendarService = CalendarService.getInstance();
      const events = await calendarService.getTodayEvents();
      
      const resource = {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify({
          events,
          count: events.length,
          timestamp: new Date().toISOString()
        })
      };

      return [resource];
    } catch (error) {
      console.error('Error fetching today\'s events:', error);
      return [{
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify({
          events: [],
          count: 0,
          error: 'Failed to fetch calendar events',
          timestamp: new Date().toISOString()
        })
      }];
    }
  }
}

export default TodayCalendarResource;