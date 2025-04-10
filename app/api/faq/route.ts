import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

// GET /api/faq - Get all FAQs for a business
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const faqs = await FAQ.find({ businessId }).sort({ createdAt: -1 });

    // Calculate usefulness score
    const usefulnessScore = calculateUsefulnessScore(faqs);

    return NextResponse.json({ faqs, usefulnessScore });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

// POST /api/faq - Create or update FAQs for a business
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, faqs } = body;

    if (!businessId || !faqs || !Array.isArray(faqs)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    await connectToDatabase();

    // Delete existing FAQs for this business
    await FAQ.deleteMany({ businessId });

    // Create new FAQs
    if (faqs.length > 0) {
      const faqsWithBusinessId = faqs.map(faq => ({
        ...faq,
        businessId,
      }));
      await FAQ.insertMany(faqsWithBusinessId);
    }

    // Calculate usefulness score
    const usefulnessScore = calculateUsefulnessScore(faqs);

    return NextResponse.json({ success: true, usefulnessScore });
  } catch (error) {
    console.error('Error saving FAQs:', error);
    return NextResponse.json({ error: 'Failed to save FAQs' }, { status: 500 });
  }
}

// Helper function to calculate usefulness score
function calculateUsefulnessScore(faqs: any[]) {
  if (!faqs || faqs.length === 0) {
    return null;
  }
  
  const faqCount = faqs.length;
  const avgQuestionLength = faqs.reduce((sum, faq) => sum + faq.question.length, 0) / faqCount;
  const avgAnswerLength = faqs.reduce((sum, faq) => sum + faq.answer.length, 0) / faqCount;
  
  // Calculate score (0-100)
  let score = Math.min(100, (
    // Base score for having FAQs
    Math.min(50, faqCount * 10) + 
    // Score for question quality (length as a simple proxy)
    Math.min(25, avgQuestionLength / 5) + 
    // Score for answer quality (length as a simple proxy)
    Math.min(25, avgAnswerLength / 10)
  ));
  
  return Math.round(score);
}