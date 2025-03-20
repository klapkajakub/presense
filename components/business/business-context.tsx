"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { IBusinessHours } from "@/models/BusinessHours"

interface BusinessInfo {
  description: string;
  hours: IBusinessHours | null;
}

interface BusinessContextType {
  businessInfo: BusinessInfo;
  updateDescription: (description: string) => void;
  updateHours: (hours: IBusinessHours) => void;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    description: "",
    hours: null
  });

  const updateDescription = useCallback((description: string) => {
    setBusinessInfo(prev => ({ ...prev, description }));
  }, []);

  const updateHours = useCallback((hours: IBusinessHours) => {
    setBusinessInfo(prev => ({ ...prev, hours }));
  }, []);

  return (
    <BusinessContext.Provider value={{
      businessInfo,
      updateDescription,
      updateHours,
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