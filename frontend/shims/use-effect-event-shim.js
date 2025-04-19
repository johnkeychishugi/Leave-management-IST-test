'use strict';

// This is a shim for the useEffectEvent function that doesn't exist in React 18.2.0
// It provides a fallback implementation using useCallback
Object.defineProperty(exports, '__esModule', { value: true });

const React = require('react');

// Shim for useEffectEvent using useCallback as fallback
function useEffectEvent(callback) {
  const callbackRef = React.useRef(callback);
  
  // Update the ref whenever the callback changes
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Return a stable function identity that calls the latest callback
  return React.useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
}

exports.useEffectEvent = useEffectEvent; 