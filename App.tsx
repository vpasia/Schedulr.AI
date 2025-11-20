
import React, { useState } from 'react';
import { CalendarEvent } from './types';
import { parseICS } from './services/icsParser';
import { getStudySuggestions } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ScheduleView from './components/ScheduleView';
import EventModal from './components/EventModal';
// FIX: Fix icon import. CalendarIcon is now defined and used, and BrainIcon is not needed in this component.
import { CalendarIcon, UploadIcon } from './components/icons';

type AppState = 'initial' | 'parsing' | 'generating' | 'displaying' | 'error';

export default function App(): React.JSX.Element {
  const [classEvents, setClassEvents] = useState<CalendarEvent[]>([]);
  const [studySuggestions, setStudySuggestions] = useState<CalendarEvent[]>([]);
  const [appState, setAppState] = useState<AppState>('initial');
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };
  
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setAppState('parsing');
    setError(null);
    setClassEvents([]);
    setStudySuggestions([]);

    try {
      const fileContent = await file.text();
      const parsedEvents = parseICS(fileContent);

      if (parsedEvents.length === 0) {
        setError("No events found in the calendar. Please check the file or try another one.");
        setAppState('error');
        return;
      }

      setClassEvents(parsedEvents);
      setAppState('generating');

      const suggestions = await getStudySuggestions(parsedEvents);
      setStudySuggestions(suggestions);
      setAppState('displaying');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process calendar. ${errorMessage}. Please ensure it is a valid .ics file.`);
      setAppState('error');
    }
  };

  const resetApp = () => {
    setAppState('initial');
    setClassEvents([]);
    setStudySuggestions([]);
    setError(null);
    setSelectedEvent(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'initial':
      case 'error':
        return (
          <div className="text-center">
            {error && (
               <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Oops!</p>
                <p>{error}</p>
              </div>
            )}
            <FileUpload onFileSelect={handleFileSelect} disabled={appState !== 'initial' && appState !== 'error'} />
            <p className="mt-4 text-slate-500">Upload your .ics school schedule to get started.</p>
          </div>
        );
      case 'parsing':
      case 'generating':
      case 'displaying':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
                {/* FIX: Add CalendarIcon for better UI/UX. */}
                <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-700">
                  <CalendarIcon className="h-8 w-8 text-indigo-500" />
                  <span>Your Weekly Schedule</span>
                </h2>
                <button 
                  onClick={resetApp}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <UploadIcon />
                  Upload New
                </button>
            </div>
            {appState !== 'displaying' && (
              <div className="flex flex-col items-center justify-center p-8 bg-white/50 rounded-lg shadow-inner text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
                 <p className="text-lg font-semibold text-indigo-700">
                  {appState === 'parsing' ? 'Parsing your calendar...' : 'Generating AI study suggestions...'}
                 </p>
                 <p className="text-slate-500">This might take a moment.</p>
              </div>
            )}
            {(appState === 'displaying' || studySuggestions.length > 0 || classEvents.length > 0) && (
              <ScheduleView 
                classEvents={classEvents} 
                studySuggestions={studySuggestions}
                onEventClick={handleEventClick} 
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 bg-[length:200%_auto] animate-[gradient-animation_5s_ease_infinite]">
            Schedulr.AI
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Visualize your class schedule and discover the best times to study with AI-powered suggestions.
          </p>
        </header>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200/50">
          {renderContent()}
        </div>
        
        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>Powered by React, Tailwind CSS, and Gemini API</p>
        </footer>
      </main>
      <EventModal event={selectedEvent} onClose={handleCloseModal} />
    </div>
  );
}