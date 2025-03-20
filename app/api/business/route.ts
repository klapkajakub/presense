import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const business = await prisma.business.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        hours: true,
        platformDescriptions: true
      }
    });

    if (!business) {
      return new NextResponse('Business not found', { status: 404 });
    }

    return NextResponse.json({
      description: business.description,
      hours: business.hours,
      platformDescriptions: business.platformDescriptions
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { description, platformVariants } = body;

    const business = await prisma.business.upsert({
      where: {
        userId: session.user.id
      },
      update: {
        description,
        platformDescriptions: {
          upsert: Object.entries(platformVariants).map(([platform, text]) => ({
            where: { platform },
            create: { platform, text },
            update: { text }
          }))
        }
      },
      create: {
        userId: session.user.id,
        description,
        platformDescriptions: {
          create: Object.entries(platformVariants).map(([platform, text]) => ({
            platform,
            text
          }))
        }
      },
      include: {
        hours: true,
        platformDescriptions: true
      }
    });

    return NextResponse.json({
      description: business.description,
      hours: business.hours,
      platformDescriptions: business.platformDescriptions
    });
  } catch (error) {
    console.error('Error saving business:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 