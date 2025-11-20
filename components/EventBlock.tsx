
import React from 'react';
import { CalendarEvent } from '../types';
import { BrainIcon, LocationMarkerIcon } from './icons';

interface EventBlockProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const EventBlock: React.FC<EventBlockProps> = ({ event, onClick }) => {
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const durationMinutes = (event.endTime.getTime() - event.startTime.getTime()) / 60000;
  
  const baseClasses = "rounded-lg p-2 h-full flex flex-col justify-start overflow-hidden text-white transition-all duration-200 ease-in-out shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer";
  const classColors = "bg-indigo-500 border-l-4 border-indigo-700";
  const studyColors = "bg-purple-500 border-l-4 border-purple-700";
  
  const title = `${event.title}\n${formatTime(event.startTime)} - ${formatTime(event.endTime)}\n${event.description || event.location || ''}`;

  return (
    <div
      className={`${baseClasses} ${event.isStudySuggestion ? studyColors : classColors}`}
      title={title}
      onClick={() => onClick(event)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(event)}
      role="button"
      tabIndex={0}
    >
      <p className="font-bold text-xs truncate">
        {event.isStudySuggestion && <BrainIcon className="inline-block mr-1 h-3 w-3" />}
        {event.title}
      </p>
      {durationMinutes > 45 && (
        <p className="text-xs opacity-80">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
      )}
      
      {/* Display description for study suggestions, or location for classes */}
      {durationMinutes > 60 && event.isStudySuggestion && event.description && (
         <p className="text-xs opacity-90 mt-1 truncate">
          {event.description}
        </p>
      )}
      {durationMinutes > 60 && !event.isStudySuggestion && event.location && (
        <p className="text-xs opacity-80 mt-1 truncate flex items-center">
          <LocationMarkerIcon className="h-3 w-3 mr-1 flex-shrink-0" /> 
          {event.location}
        </p>
      )}
    </div>
  );
};

export default EventBlock;