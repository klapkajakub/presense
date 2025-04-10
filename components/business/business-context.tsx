"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { IBusinessHours } from "@/models/BusinessHours"

interface BusinessInfo {
  description: string;
  hours: IBusinessHours | null;
  platformVariants?: Record<string, string>;
  platformDescriptions?: {
    google: string;
    facebook: string;
    firmy: string;
    instagram: string;
  };
}

interface BusinessContextType {
  businessInfo: BusinessInfo;
  updateDescription: (description: string) => void;
  updateHours: (hours: IBusinessHours) => void;
  updatePlatformDescriptions: (descriptions: any) => void;
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    description: "",
    hours: null,
    platformVariants: {},
    platformDescriptions: {
      google: "",
      facebook: "",
      firmy: "",
      instagram: ""
    }
  });

  const updateDescription = useCallback((description: string) => {
    setBusinessInfo(prev => ({ ...prev, description }));
  }, []);

  const updateHours = useCallback((hours: IBusinessHours) => {
    setBusinessInfo(prev => ({ ...prev, hours }));
  }, []);

  const updatePlatformDescriptions = useCallback((descriptions: any) => {
    setBusinessInfo(prev => ({ 
      ...prev, 
      platformDescriptions: descriptions 
    }));
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch business data
      const businessRes = await fetch('/api/business');
      const businessData = await businessRes.json();
      
      // Fetch business descriptions
      const descriptionRes = await fetch('/api/business-description');
      const descriptionData = await descriptionRes.json();
      
      // Fetch business hours
      const hoursRes = await fetch('/api/business-hours');
      const hoursData = await hoursRes.json();
      
      console.log('Loaded business data:', businessData);
      console.log('Loaded description data:', descriptionData);
      console.log('Loaded hours data:', hoursData);
      
      setBusinessInfo({
        description: businessData?.description || "",
        platformVariants: businessData?.platformVariants || {},
        hours: hoursData?.hours || null,
        platformDescriptions: descriptionData?.data?.descriptions || {
          google: "",
          facebook: "",
          firmy: "",
          instagram: ""
        }
      });
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
    <BusinessContext.Provider value={{
      businessInfo,
      updateDescription,
      updateHours,
      updatePlatformDescriptions,
      isLoading,
      error,
      refetchData: fetchData
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
} 