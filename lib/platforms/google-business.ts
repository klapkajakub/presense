import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { IBusinessHours } from '@/models/BusinessHours';

// Define interface for Business information
interface BusinessInfo {
  name: string;
  description: string;
  primaryPhone: string;
  websiteUrl: string;
}

// Define interface for API response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Creates a Google OAuth2 client
 */
export function createGoogleOAuth2Client(): OAuth2Client {
  // Check for required environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error('Missing required Google API environment variables');
  }

  console.log(`Creating Google OAuth client with:
    ClientID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 10)}...
    RedirectURI: ${process.env.GOOGLE_REDIRECT_URI}
  `);

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Initialize a Google My Business API client with authentication
 */
export function initializeGoogleMyBusinessApi(accessToken: string, refreshToken: string): any {
  try {
    const oauth2Client = createGoogleOAuth2Client();
    
    // Set credentials
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // @ts-ignore - Type issues with Google API client
    return google.mybusiness('v4');
  } catch (error) {
    console.error('Failed to initialize Google My Business API:', error);
    throw error;
  }
}

/**
 * Get account list from Google My Business
 */
export async function getGoogleBusinessAccounts(
  accessToken: string, 
  refreshToken: string
): Promise<ApiResponse<any[]>> {
  try {
    const oauth2Client = createGoogleOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // @ts-ignore - Type issues with Google API client
    const mybusiness = google.mybusiness('v4');
    
    const accounts = await mybusiness.accounts.list({
      auth: oauth2Client
    });

    if (!accounts.data.accounts || accounts.data.accounts.length === 0) {
      return {
        success: false,
        message: 'No Google Business accounts found',
        data: []
      };
    }

    return {
      success: true,
      data: accounts.data.accounts
    };
  } catch (error) {
    console.error('Error fetching Google Business accounts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to fetch Google Business accounts'
    };
  }
}

/**
 * Get locations list for a Google My Business account
 */
export async function getGoogleBusinessLocations(
  accessToken: string,
  refreshToken: string,
  accountId: string
): Promise<ApiResponse<any[]>> {
  try {
    const oauth2Client = createGoogleOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // @ts-ignore - Type issues with Google API client
    const mybusiness = google.mybusiness('v4');
    
    const locations = await mybusiness.accounts.locations.list({
      auth: oauth2Client,
      parent: accountId
    });

    if (!locations.data.locations || locations.data.locations.length === 0) {
      return {
        success: false,
        message: 'No Google Business locations found',
        data: []
      };
    }

    return {
      success: true,
      data: locations.data.locations
    };
  } catch (error) {
    console.error('Error fetching Google Business locations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to fetch Google Business locations'
    };
  }
}

/**
 * Update Google My Business profile information
 */
export async function updateGoogleBusinessInfo(
  accessToken: string,
  refreshToken: string,
  locationId: string,
  businessInfo: Partial<BusinessInfo>
): Promise<ApiResponse<any>> {
  try {
    const oauth2Client = createGoogleOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // @ts-ignore - Type issues with Google API client
    const mybusiness = google.mybusiness('v4');
    
    const updatedLocation = await mybusiness.accounts.locations.patch({
      auth: oauth2Client,
      name: locationId,
      updateMask: Object.keys(businessInfo).map(key => `profile.${key}`).join(','),
      requestBody: {
        profile: businessInfo
      }
    });

    return {
      success: true,
      data: updatedLocation.data,
      message: 'Google Business profile updated successfully'
    };
  } catch (error) {
    console.error('Error updating Google Business profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to update Google Business profile'
    };
  }
}

/**
 * Convert business hours data to Google My Business format and update
 */
export async function updateGoogleBusinessHours(
  accessToken: string,
  refreshToken: string,
  locationId: string,
  hours: IBusinessHours
): Promise<ApiResponse<any>> {
  try {
    const oauth2Client = createGoogleOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    // @ts-ignore - Type issues with Google API client
    const mybusiness = google.mybusiness('v4');
    
    // Convert hours to Google format
    const googleHours = convertToGoogleHours(hours);
    
    const updatedLocation = await mybusiness.accounts.locations.patch({
      auth: oauth2Client,
      name: locationId,
      updateMask: 'regularHours',
      requestBody: {
        regularHours: googleHours
      }
    });

    return {
      success: true,
      data: updatedLocation.data,
      message: 'Google Business hours updated successfully'
    };
  } catch (error) {
    console.error('Error updating Google Business hours:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to update Google Business hours'
    };
  }
}

/**
 * Convert our business hours format to Google Business hours format
 */
function convertToGoogleHours(hours: IBusinessHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return {
    periods: days.map(day => {
      const dayKey = day as keyof typeof hours.regularHours;
      const daySchedule = hours.regularHours[dayKey];
      
      if (!daySchedule.isOpen || !daySchedule.ranges || daySchedule.ranges.length === 0) {
        return null; // Closed day
      }
      
      return {
        openDay: day.toUpperCase(),
        openTime: daySchedule.ranges[0].open.replace(':', ''),
        closeDay: day.toUpperCase(),
        closeTime: daySchedule.ranges[0].close.replace(':', '')
      };
    }).filter(Boolean)
  };
} 