import { google } from 'googleapis';
import { PlatformConnection } from '@/models/PlatformConnection';
import { BusinessHours } from '@/models/BusinessHours';

interface SyncData {
  description: string;
  hours: BusinessHours;
}

export async function syncGoogleBusiness(connection: PlatformConnection, data: SyncData) {
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

  // Update business description
  await mybusiness.accounts.locations.patch({
    auth: oauth2Client,
    name: connection.platformBusinessId,
    requestBody: {
      profile: {
        description: data.description
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
}

export async function syncFacebook(connection: PlatformConnection, data: SyncData) {
  // Update business description
  await fetch(
    `https://graph.facebook.com/v18.0/${connection.platformBusinessId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${connection.accessToken}`
      },
      body: JSON.stringify({
        about: data.description
      })
    }
  );

  // Update business hours
  const hours = convertToFacebookHours(data.hours);
  await fetch(
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