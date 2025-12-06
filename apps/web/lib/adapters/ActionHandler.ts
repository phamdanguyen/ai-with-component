/**
 * ActionHandler
 * 
 * Adapter for handling events from Crayon components.
 * Propagates actions to the application state or backend.
 */

export type ActionCallback = (action: any) => void;

export const createActionHandler = (sessionId?: string): ActionCallback => {
    return (action: any) => {
        console.log('[ActionHandler] Processing action:', action, 'Session:', sessionId);

        // Future: Dispatch to backend
        // fetch('/api/chat/action', { ... })

        // Future: Update local state via Zustand
    };
};

export const defaultActionHandler: ActionCallback = createActionHandler();
