import { MCPResource } from "mcp-framework";
import { CalendarService } from "../services/CalendarService.js";

class WeeklyCalendarResource extends MCPResource {
  uri = "resource://weekly-calendar";
  name = "Weekly Calendar Events";
  description = "Returns events scheduled for the next 7 days from Google Calendar";
  mimeType = "application/json";

  async read() {
    try {
      const calendarService = CalendarService.getInstance();
      const events = await calendarService.getWeekEvents();
      
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
      console.error('Error fetching events for the next 7 days:', error);
      return [{
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify({
          events: [],
          count: 0,
          error: 'Failed to fetch calendar events for the next 7 days',
          timestamp: new Date().toISOString()
        })
      }];
    }
  }
}

export default WeeklyCalendarResource;