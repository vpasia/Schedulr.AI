
import React from 'react';
import { CalendarEvent } from '../types';
import EventBlock from './EventBlock';

interface ScheduleViewProps {
  classEvents: CalendarEvent[];
  studySuggestions: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM

const ScheduleView: React.FC<ScheduleViewProps> = ({ classEvents, studySuggestions, onEventClick }) => {
  const allEvents = [...classEvents, ...studySuggestions];
  
  const getGridPosition = (event: CalendarEvent) => {
    const startHour = event.startTime.getHours() + event.startTime.getMinutes() / 60;
    const endHour = event.endTime.getHours() + event.endTime.getMinutes() / 60;
    
    // Grid rows start at 1, header is row 1. Time slots start at 7 AM.
    const gridRowStart = (startHour - 7) * 2 + 2; // Each hour has two 30-min slots
    const gridRowEnd = (endHour - 7) * 2 + 2;

    const dayIndex = event.startTime.getDay();
    const gridColumnStart = dayIndex + 2; // Grid columns start at 1, time labels are col 1

    return {
        gridRow: `${Math.max(2, Math.round(gridRowStart))} / ${Math.min(34, Math.round(gridRowEnd))}`, // 16 hours * 2 slots/hr + 2 header rows
        gridColumn: `${gridColumnStart}`,
    };
  };

  return (
    <div className="relative overflow-x-auto">
        <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] grid-rows-[auto_repeat(32,25px)] gap-x-2">
            {/* Time column - This div is a placeholder for column width */}
            <div className="sticky left-0 bg-transparent z-10"></div>
            {DAYS.map((day, i) => (
                <div key={day} className="text-center font-bold text-slate-600 p-2 border-b-2 border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-20">
                    {day}
                </div>
            ))}
            
            {/* Hour labels and grid lines */}
            {HOURS.map(hour => {
                const time = hour > 12 ? `${hour-12} PM` : (hour === 12 ? '12 PM' : `${hour} AM`);
                return (
                    <React.Fragment key={hour}>
                        <div className="row-start-[] text-right text-xs pr-2 text-slate-500 -mt-2 sticky left-0 bg-[#F8F9FE]/80 backdrop-blur-md z-10" style={{ gridRow: (hour - 7) * 2 + 2 }}>
                            {time}
                        </div>
                        <div className="col-start-2 col-span-7 border-b border-slate-200" style={{ gridRow: (hour - 7) * 2 + 2 }} />
                    </React.Fragment>
                );
            })}
             
             {/* Render Events */}
             {allEvents.map((event) => (
                <div key={event.id} style={getGridPosition(event)}>
                   <EventBlock event={event} onClick={onEventClick} />
                </div>
             ))}
        </div>
    </div>
  );
};

export default ScheduleView;