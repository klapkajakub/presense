'use client';

import { useEffect, useState } from 'react';

type BusinessData = {
  business: any;
  businessDescription: any;
  isLoading: boolean;
  error: string | null;
};

export default function BusinessDataLoader() {
  const [data, setData] = useState<BusinessData>({
    business: null,
    businessDescription: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        // Fetch business data
        const businessRes = await fetch('/api/business');
        const businessData = await businessRes.json();
        
        // Fetch business descriptions
        const descriptionRes = await fetch('/api/business-description');
        const descriptionData = await descriptionRes.json();
        
        console.log('Loaded business data:', businessData);
        console.log('Loaded description data:', descriptionData);
        
        setData({
          business: businessData,
          businessDescription: descriptionData.data,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading business data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load business data'
        }));
      }
    };

    fetchBusinessData();
  }, []);

  return null; // This component doesn't render anything
} 