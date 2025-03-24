import { google } from 'googleapis';
import { PlatformConnection, PlatformType } from '@/models/PlatformConnection';
import { BusinessHours } from '@/models/BusinessHours';

interface EnhancedSyncData {
  description: string;
  platformDescriptions: Record<string, string>;
  hours: BusinessHours;
}

/**
 * Enhanced sync service that supports platform-specific descriptions
 * and provides better error handling and logging
 */
export async function syncGoogleBusinessEnhanced(connection: PlatformConnection, data: EnhancedSyncData) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/platform-connections/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken
    });

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

export async function syncFacebookEnhanced(connection: PlatformConnection, data: EnhancedSyncData) {
  try {
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
export async function syncPlatform(connection: PlatformConnection, data: EnhancedSyncData) {
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
}

function convertToGoogleHours(hours: BusinessHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.map(day => ({
    dayOfWeek: day.toUpperCase(),
    openTime: hours.regularHours[day].ranges[0]?.open || '00:00',
    closeTime: hours.regularHours[day].ranges[0]?.close || '00:00',
    isOpen: hours.regularHours[day].isOpen
  }));
}

function convertToFacebookHours(hours: BusinessHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.map(day => ({
    day: day,
    open: hours.regularHours[day].ranges[0]?.open || '00:00',
    close: hours.regularHours[day].ranges[0]?.close || '00:00',
    is_closed: !hours.regularHours[day].isOpen
  }));
}