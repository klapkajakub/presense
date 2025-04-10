"use client"

import { useState, useEffect } from 'react'
import { ActionCall } from '@/types/action'
import { Button } from '@/components/ui/button'
import { IconContainer } from '@/components/ui/icon-container'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatActionCardProps {
  action: ActionCall
  onExecute?: (actionId: string, parameters: Record<string, any>) => Promise<void>
}

export function ChatActionCard({ action, onExecute }: ChatActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [actionState, setActionState] = useState(action)
  
  // Listen for action updates from other components
  useEffect(() => {
    const handleActionUpdate = (event: CustomEvent) => {
      const { messageId, actionIndex, status, result, error } = event.detail;
      // Update local state if this is our action
      if (status) {
        setActionState(prev => ({
          ...prev,
          status,
          result: result || prev.result,
          error: error || prev.error
        }));
      }
    };
    
    // Add event listener for custom action-updated events
    window.addEventListener('action-updated', handleActionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('action-updated', handleActionUpdate as EventListener);
    };
  }, []);
  
  const handleExecute = async () => {
    if (!onExecute || actionState.status !== 'pending') return
    
    setIsExecuting(true)
    try {
      await onExecute(actionState.actionId, actionState.parameters)
    } catch (error) {
      console.error('Error executing action:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const getStatusIcon = () => {
    switch (actionState.status) {
      case 'pending':
        return null
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getActionName = () => {
    // Convert actionId to a more readable format
    // e.g., 'save-description' -> 'Save Description'
    return actionState.actionId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="flex items-start gap-3 my-2">
      <div className="flex-1">
        <div className={cn(
          "rounded-lg px-4 py-3 border",
          "bg-primary/5 hover:bg-primary/10 transition-colors",
          actionState.status === 'success' && "border-green-200 dark:border-green-800",
          actionState.status === 'error' && "border-red-200 dark:border-red-800"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconContainer 
                icon={<i className="fa-solid fa-bolt"></i>}
                className="bg-primary/10 h-5 w-5" 
              />
              <span className="text-sm font-medium">
                {getActionName()}
              </span>
              {getStatusIcon()}
            </div>
            
            {actionState.status === 'pending' && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleExecute}
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Executing...
                  </>
                ) : 'Execute'}
              </Button>
            )}
          </div>
          
          {/* Display parameters */}
          {Object.keys(actionState.parameters).length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(actionState.parameters).map(([key, value]) => (
                  <div key={key} className="flex items-start">
                    <span className="font-medium mr-1">{key}:</span>
                    <span className="truncate">
                      {typeof value === 'string' && value.length > 30
                        ? `${value.substring(0, 30)}...`
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Display result or error */}
          {actionState.status === 'success' && actionState.result && (
            <div className="mt-2 text-sm">
              {actionState.result.action === 'open-modal' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4" />
                  <span>{actionState.result.message || 'Modal opened successfully'}</span>
                </div>
              )}
              
              {actionState.result.action === 'save-description' && (
                <div className="text-green-600 dark:text-green-400">
                  <div>{actionState.result.message}</div>
                  <div className="text-xs mt-1">Platform: {actionState.result.platform}</div>
                </div>
              )}
              
              {actionState.result.action === 'search-results' && (
                <div>
                  <div className="text-green-600 dark:text-green-400 mb-1">{actionState.result.message}</div>
                  <div className="bg-muted p-2 rounded text-xs">
                    {actionState.result.results.map((result: string, i: number) => (
                      <div key={i} className="mb-1">{result}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {actionState.result.action === 'generated-image' && (
                <div>
                  <div className="text-green-600 dark:text-green-400 mb-1">{actionState.result.message}</div>
                  <div className="mt-2">
                    <img 
                      src={actionState.result.imageUrl} 
                      alt={actionState.result.prompt}
                      className="rounded-md max-w-full max-h-[200px] object-contain" 
                    />
                  </div>
                </div>
              )}
              
              {/* Fallback for any other type of result */}
              {!actionState.result.action && (
                <div className="text-green-600 dark:text-green-400">
                  Result: {typeof actionState.result === 'object' 
                    ? JSON.stringify(actionState.result) 
                    : String(actionState.result)}
                </div>
              )}
            </div>
          )}
          
          {actionState.status === 'error' && actionState.error && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              Error: {actionState.error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}