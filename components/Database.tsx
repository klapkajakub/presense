'use client';

import { useEffect, useState } from 'react';

export function Database() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initDatabase() {
      try {
        // Call the API route to initialize the database on the server
        const response = await fetch('/api/init-db');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to initialize database');
        }
        
        setConnected(true);
        console.log('Database initialized successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        console.error('Database initialization error:', err);
      }
    }

    initDatabase();
  }, []);

  // This component doesn't render anything
  return null;
} 