import React, { createContext, useState, useContext } from 'react';

// Create context
const ApiContext = createContext();

// Provider component
export const ApiProvider = ({ children }) => {
  const [apiCalls, setApiCalls] = useState({});

  // Start loading for a specific API call
  const startLoading = (callId) => {
    setApiCalls(prev => ({
      ...prev,
      [callId]: { loading: true, error: null }
    }));
  };

  // End loading for a specific API call
  const endLoading = (callId, error = null) => {
    setApiCalls(prev => ({
      ...prev,
      [callId]: { loading: false, error }
    }));
  };

  // Check if a specific API call is loading
  const isLoading = (callId) => {
    return apiCalls[callId]?.loading || false;
  };

  // Get error for a specific API call
  const getError = (callId) => {
    return apiCalls[callId]?.error || null;
  };

  // Clear all API call states
  const clearApiCalls = () => {
    setApiCalls({});
  };

  return (
    <ApiContext.Provider value={{
      startLoading,
      endLoading,
      isLoading,
      getError,
      clearApiCalls
    }}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook for using the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};