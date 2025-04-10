import { NextResponse } from 'next/server';
import { getActionById } from '@/lib/chat/actions';
import { executeAction } from '@/lib/chat/action-handler';

export async function POST(req: Request) {
  try {
    const { actionId, parameters } = await req.json();
    
    // Validate that the action exists
    const action = getActionById(actionId);
    if (!action) {
      return NextResponse.json(
        { success: false, error: `Action '${actionId}' not found` },
        { status: 404 }
      );
    }
    
    // Execute the action using the action handler
    const actionResult = await executeAction({
      actionId,
      parameters,
      status: 'pending'
    });
    
    // Return the result
    return NextResponse.json({
      success: actionResult.success,
      result: actionResult.result,
      error: actionResult.error
    }, { 
      status: actionResult.success ? 200 : 400 
    });
    
  } catch (error) {
    console.error('Action execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}