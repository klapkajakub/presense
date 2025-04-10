"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { IBusinessHours } from "@/models/BusinessHours"

interface BusinessInfo {
  description: string;
  hours: IBusinessHours | null;
  platformDescriptions?: Record<string, string>;
}

interface BusinessContextType {
  businessInfo: BusinessInfo;
  updateDescription: (description: string) => void;
  updateHours: (hours: IBusinessHours) => void;
  updatePlatformDescription: (platform: string, description: string) => void;
  updatePlatformDescriptions: (descriptions: Record<string, string>) => void;
  fetchBusinessData: () => Promise<void>;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    description: "",
    hours: null,
    platformDescriptions: {}
  });
  
  const fetchBusinessData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch business description and platform descriptions
      const descResponse = await fetch('/api/business');
      if (descResponse.ok) {
        const descData = await descResponse.json();
        if (descData.success && descData.data) {
          setBusinessInfo(prev => ({
            ...prev,
            description: descData.data.description || "",
            platformDescriptions: descData.data.platformVariants || {}
          }));
        }
      }

      // Fetch business hours
      const hoursResponse = await fetch('/api/business-hours');
      if (hoursResponse.ok) {
        const hoursData = await hoursResponse.json();
        if (hoursData.success && hoursData.data) {
          setBusinessInfo(prev => ({
            ...prev,
            hours: hoursData.data
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  const updateDescription = useCallback((description: string) => {
    setBusinessInfo(prev => ({ ...prev, description }));
  }, []);

  const updateHours = useCallback((hours: IBusinessHours) => {
    setBusinessInfo(prev => ({ ...prev, hours }));
  }, []);

  const updatePlatformDescription = useCallback((platform: string, description: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      platformDescriptions: {
        ...prev.platformDescriptions,
        [platform]: description
      }
    }));
  }, []);

  const updatePlatformDescriptions = useCallback((descriptions: Record<string, string>) => {
    setBusinessInfo(prev => ({
      ...prev,
      platformDescriptions: descriptions
    }));
  }, []);

  return (
    <BusinessContext.Provider value={{
      businessInfo,
      updateDescription,
      updateHours,
      updatePlatformDescription,
      updatePlatformDescriptions,
      fetchBusinessData,
      isLoading
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