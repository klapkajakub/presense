import { google } from 'googleapis';
import { PlatformConnection, PlatformType } from '@/models/PlatformConnection';
import { IBusinessHours } from '@/models/BusinessHours';

interface EnhancedSyncData {
  description: string;
  platformDescriptions: Record<string, string>;
  hours: IBusinessHours;
}

interface SyncResult {
  success: boolean;
  message: string;
  error?: string;
}

type WeekdayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Enhanced sync service that supports platform-specific descriptions
 * and provides better error handling and logging
 */
export async function syncGoogleBusinessEnhanced(connection: any, data: EnhancedSyncData): Promise<SyncResult> {
  try {
    // Validate credentials
    if (!connection.accessToken || !connection.refreshToken || !connection.platformBusinessId) {
      throw new Error('Missing Google credentials or business ID');
    }

    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('Missing required Google API environment variables');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/platform-connections/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken
    });

    // Create the Google My Business client
    // @ts-ignore - Type issues with Google API client
    const mybusiness = google.mybusiness('v4');

    // Use platform-specific description if available, otherwise use the main description
    const descriptionToUse = data.platformDescriptions?.google || data.description;

    // Update business description
    await mybusiness.accounts.locations.patch({
      auth: oauth2Client,
      name: connection.platformBusinessId,
      requestBody: {
        profile: {
          description: descriptionToUse
        }
      }
    });

    // Update business hours
    const hours = convertToGoogleHours(data.hours);
    await mybusiness.accounts.locations.patch({
      auth: oauth2Client,
      name: connection.platformBusinessId,
      requestBody: {
        regularHours: hours
      }
    });

    return {
      success: true,
      message: 'Google Business Profile updated successfully'
    };
  } catch (error) {
    console.error('Error syncing with Google Business:', error);
    return {
      success: false,
      message: 'Failed to update Google Business Profile',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function syncFacebookEnhanced(connection: any, data: EnhancedSyncData): Promise<SyncResult> {
  try {
    // Validate credentials
    if (!connection.accessToken || !connection.platformBusinessId) {
      throw new Error('Missing Facebook credentials or business ID');
    }

    // Use platform-specific description if available, otherwise use the main description
    const descriptionToUse = data.platformDescriptions?.facebook || data.description;

    // Update business description
    const descResponse = await fetch(
      `https://graph.facebook.com/v18.0/${connection.platformBusinessId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`
        },
        body: JSON.stringify({
          about: descriptionToUse
        })
      }
    );

    if (!descResponse.ok) {
      const errorData = await descResponse.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    // Update business hours
    const hours = convertToFacebookHours(data.hours);
    const hoursResponse = await fetch(
      `https://graph.facebook.com/v18.0/${connection.platformBusinessId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`
        },
        body: JSON.stringify({
          hours: hours
        })
      }
    );

    if (!hoursResponse.ok) {
      const errorData = await hoursResponse.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    return {
      success: true,
      message: 'Facebook Page updated successfully'
    };
  } catch (error) {
    console.error('Error syncing with Facebook:', error);
    return {
      success: false,
      message: 'Failed to update Facebook Page',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Generic sync function that handles any platform type
 */
export async function syncPlatform(connection: any, data: EnhancedSyncData): Promise<SyncResult> {
  try {
    // Validate common inputs
    if (!connection) {
      throw new Error('Platform connection is required');
    }
    
    if (!data.hours) {
      throw new Error('Business hours data is required');
    }
    
    switch (connection.platform) {
      case 'google':
        return syncGoogleBusinessEnhanced(connection, data);
      case 'facebook':
        return syncFacebookEnhanced(connection, data);
      case 'instagram':
        // Instagram uses the same API as Facebook
        return syncFacebookEnhanced(connection, data);
      case 'firmy':
        // Implement Firmy.cz sync when API is available
        return {
          success: false,
          message: `Firmy.cz integration is not yet implemented`,
          error: 'Platform integration in progress'
        };
      default:
        return {
          success: false,
          message: `Unsupported platform: ${connection.platform}`,
          error: 'Platform not supported'
        };
    }
  } catch (error) {
    console.error('Error in syncPlatform:', error);
    return {
      success: false,
      message: 'Failed to sync with platform',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function convertToGoogleHours(hours: IBusinessHours) {
  const days: WeekdayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.map(day => {
    const daySchedule = hours.regularHours[day];
    return {
      dayOfWeek: day.toUpperCase(),
      openTime: daySchedule?.ranges[0]?.open || '00:00',
      closeTime: daySchedule?.ranges[0]?.close || '00:00',
      isOpen: daySchedule?.isOpen || false
    };
  });
}

function convertToFacebookHours(hours: IBusinessHours) {
  const days: WeekdayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.map(day => {
    const daySchedule = hours.regularHours[day];
    return {
      day: day,
      open: daySchedule?.ranges[0]?.open || '00:00',
      close: daySchedule?.ranges[0]?.close || '00:00',
      is_closed: !(daySchedule?.isOpen || false)
    };
  });
}