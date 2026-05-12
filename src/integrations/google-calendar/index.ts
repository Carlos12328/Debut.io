export interface GoogleCalendarClient {
  syncAppointments(eventId: string): Promise<void>;
}
