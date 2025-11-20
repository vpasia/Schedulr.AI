
import React, { useEffect } from 'react';
import { CalendarEvent } from '../types';
import { BrainIcon, CalendarIcon, ClockIcon, CloseIcon, LocationMarkerIcon } from './icons';

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!event) return null;

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const timeRange = `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
  const dayOfWeek = event.startTime.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200/50 w-full max-w-md relative animate-[slideIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${event.isStudySuggestion ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {event.isStudySuggestion ? <BrainIcon className="h-7 w-7" /> : <CalendarIcon className="h-7 w-7" />}
          </div>
          <div>
            <span className={`text-sm font-bold ${event.isStudySuggestion ? 'text-purple-600' : 'text-indigo-600'}`}>
              {event.isStudySuggestion ? 'AI Study Suggestion' : 'Class Schedule'}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">{event.title}</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-slate-700">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 text-slate-500" />
            <span>{dayOfWeek}, {timeRange}</span>
          </div>
          {event.isStudySuggestion && event.description && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Reason:</h3>
              <p className="pl-2 border-l-2 border-purple-300 text-slate-600">{event.description}</p>
            </div>
          )}
          {!event.isStudySuggestion && event.location && (
            <div className="flex items-center gap-3">
              <LocationMarkerIcon className="h-5 w-5 text-slate-500" />
              <span>{event.location}</span>
            </div>
          )}
           {!event.isStudySuggestion && event.description && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">Notes:</h3>
              <p className="pl-2 border-l-2 border-indigo-300 text-slate-600">{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
