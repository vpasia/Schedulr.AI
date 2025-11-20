import { CalendarEvent } from '../types';

declare const ICAL: any;

export const parseICS = (icsData: string): CalendarEvent[] => {
    const jcalData = ICAL.parse(icsData);
    const component = new ICAL.Component(jcalData);
    const vevents = component.getAllSubcomponents('vevent');
    const allFoundEvents: CalendarEvent[] = [];
    
    // Set a reasonable limit for recurrence expansion to avoid infinite loops, e.g., 6 months from now.
    const recurrenceLimit = new Date();
    recurrenceLimit.setMonth(recurrenceLimit.getMonth() + 6);

    vevents.forEach((vevent: any) => {
        const event = new ICAL.Event(vevent);

        const summary = event.summary;
        const location = event.location;
        const description = event.description;
        
        const addEvent = (start: Date, end: Date) => {
            allFoundEvents.push({
                id: `${vevent.getFirstPropertyValue('uid')}-${start.toISOString()}`,
                title: summary,
                startTime: start,
                endTime: end,
                location: location,
                description: description,
            });
        };
        
        if (event.isRecurring()) {
            const iterator = event.iterator();
            let next;
            while ((next = iterator.next()) && next.toJSDate() < recurrenceLimit) {
                 const occ = event.getOccurrenceDetails(next);
                 addEvent(occ.startDate.toJSDate(), occ.endDate.toJSDate());
            }
        } else {
            const startDate = event.startDate.toJSDate();
            // Non-recurring events might still be far in the future
            if (startDate < recurrenceLimit) {
                addEvent(startDate, event.endDate.toJSDate());
            }
        }
    });

    if (allFoundEvents.length === 0) {
        return [];
    }

    // Sort all events to find the first one
    allFoundEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Determine the week to display. We'll display the week of the first event.
    const firstEventDate = allFoundEvents[0].startTime;
    
    // Find the Sunday of that week
    const scheduleStartDate = new Date(firstEventDate);
    scheduleStartDate.setDate(scheduleStartDate.getDate() - scheduleStartDate.getDay());
    scheduleStartDate.setHours(0, 0, 0, 0); // Start of Sunday

    // Find the end of that week (start of the next Sunday)
    const scheduleEndDate = new Date(scheduleStartDate);
    scheduleEndDate.setDate(scheduleEndDate.getDate() + 7);

    // Filter events to only include those within the first week of the schedule
    const eventsForFirstWeek = allFoundEvents.filter(event => 
        event.startTime >= scheduleStartDate && event.startTime < scheduleEndDate
    );
    
    return eventsForFirstWeek;
};
