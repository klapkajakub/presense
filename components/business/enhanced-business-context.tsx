\"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { IBusinessHours } from "@/models/BusinessHours"
import { PLATFORM_CONFIGS } from "@/types/business"

interface PlatformDescriptions {
  [platform: string]: string;
}

interface BusinessInfo {
  description: string;
  platformDescriptions: PlatformDescriptions;
  hours: IBusinessHours | null;
}

interface BusinessContextType {
  businessInfo: BusinessInfo;
  updateDescription: (description: string) => void;
  updatePlatformDescription: (platform: string, description: string) => void;
  updateHours: (hours: IBusinessHours) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchBusinessData: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function EnhancedBusinessProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    description: "",
    platformDescriptions: {},
    hours: null
  });

  const fetchBusinessData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch business description
      const descResponse = await fetch('/api/business-description');
      if (descResponse.ok) {
        const descData = await descResponse.json();
        if (descData.success && descData.data) {
          setBusinessInfo(prev => ({
            ...prev,
            description: descData.data.description || "",
            platformDescriptions: descData.data.descriptions || {}
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

  const updatePlatformDescription = useCallback((platform: string, description: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      platformDescriptions: {
        ...prev.platformDescriptions,
        [platform]: description
      }
    }));
  }, []);

  const updateHours = useCallback((hours: IBusinessHours) => {
    setBusinessInfo(prev => ({ ...prev, hours }));
  }, []);

  return (
    <BusinessContext.Provider value={{
      businessInfo,
      updateDescription,
      updatePlatformDescription,
      updateHours,
      isLoading,
      setIsLoading,
      fetchBusinessData
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useEnhancedBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useEnhancedBusiness must be used within an EnhancedBusinessProvider");
  }
  return context;
}