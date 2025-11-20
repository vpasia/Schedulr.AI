
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  isStudySuggestion?: boolean;
}
