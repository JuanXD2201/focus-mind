'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

// This is a client component that listens for Firestore permission errors
// and throws them to be caught by the Next.js error overlay.
// This provides a better developer experience for debugging security rules.
// It is rendered in the root layout and does not render any UI.

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // We throw the error here to make it visible in the Next.js error overlay.
      // This is only for development and should not be used in production.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
