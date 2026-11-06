import { EventEmitter } from 'events';

// A simple event emitter to broadcast errors across the application.
// This is used to decouple the error source from the error listener.
export const errorEmitter = new EventEmitter();
