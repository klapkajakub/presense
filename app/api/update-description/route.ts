import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export async function POST(request: Request) {
        try {
                const { description } = await request.json();

                // Get fresh access token
                const { token } = await oauth2Client.getAccessToken();

                if (!token) {
                        throw new Error("Failed to get access token");
                }

                // Update business description
                const response = await fetch(
                        `https://businessprofileperformance.googleapis.com/v1/locations/${process.env.LOCATION_ID}`,
                        {
                                method: "PATCH",
                                headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                        profile: {
                                                description: description,
                                        },
                                }),
                        }
                );

                if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`API Error: ${JSON.stringify(errorData)}`);
                }

                const data = await response.json();
                console.log("Update successful:", data);

                return NextResponse.json({
                        success: true,
                        message: "Popis firmy byl úspěšně aktualizován"
                });

        } catch (error: any) {
                console.error("Chyba při aktualizaci popisu:", error);
                return NextResponse.json(
                        { error: error.message },
                        { status: 500 }
                );
        }
}