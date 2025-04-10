'use client';

import { useBusiness } from '@/components/business/business-context';

export default function BusinessDebug() {
  const { businessInfo, isLoading, error, refetchData } = useBusiness();

  if (isLoading) {
    return (
      <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">Loading business data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 dark:bg-red-900">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => refetchData()} 
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-2">Business Data Debug</h2>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-1">Basic Info</h3>
        <p><strong>Description:</strong> {businessInfo.description || 'Not set'}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-1">Platform Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {businessInfo.platformDescriptions && Object.entries(businessInfo.platformDescriptions).map(([platform, text]) => (
            <div key={platform} className="border p-2 rounded-sm">
              <p className="font-medium capitalize">{platform}</p>
              <p className="text-sm truncate">{text || 'Empty'}</p>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => refetchData()} 
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md"
      >
        Refresh Data
      </button>
    </div>
  );
} 