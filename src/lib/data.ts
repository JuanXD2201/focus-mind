
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  joined: string; // ISO String
}

export interface CalendarEvent {
  id: string;
  date: Date;
  time: string;
  title: string;
  userId: string;
}

// Mock data is no longer the primary source of truth, but can be kept for fallback or initial structure reference.
// For this app, we will rely solely on Firestore.

export const survey = {
  id: 'survey-1',
  question: '¿Cómo te sientes hoy?',
  options: ['Excelente', 'Bien', 'Más o menos', 'No muy bien', 'Mal'],
};
