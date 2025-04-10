'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our context
interface BusinessContextType {
  business: any;
  businessDescription: any;
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
}

// Create the context with default values
const BusinessContext = createContext<BusinessContextType>({
  business: null,
  businessDescription: null,
  isLoading: true,
  error: null,
  refetchData: async () => {}
});

// Hook to use the business context
export const useBusinessData = () => useContext(BusinessContext);

// Provider component
export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<any>(null);
  const [businessDescription, setBusinessDescription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch business data
      const businessRes = await fetch('/api/business');
      const businessData = await businessRes.json();
      setBusiness(businessData);
      
      // Fetch business descriptions
      const descriptionRes = await fetch('/api/business-description');
      const descriptionData = await descriptionRes.json();
      setBusinessDescription(descriptionData.data);
      
      console.log('Loaded business data:', businessData);
      console.log('Loaded description data:', descriptionData);
      
      setError(null);
    } catch (err) {
      console.error('Error loading business data:', err);
      setError('Failed to load business data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <BusinessContext.Provider 
      value={{ 
        business, 
        businessDescription, 
        isLoading, 
        error, 
        refetchData: fetchData 
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
} 