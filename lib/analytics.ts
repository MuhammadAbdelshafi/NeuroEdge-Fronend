import api from '@/lib/api';

export const logEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
    try {
        // We need an endpoint to receive these events. 
        // I haven't created a specific POST /analytics/events endpoint yet in the routes.
        // Let's create that backend endpoint first or use a placeholder.
        // Actually, the plan mentioned "POST /analytics/events". I missed creating the route for it in the backend.
        // I should go back and create `app/modules/analytics/routes.py` and register it.

        await api.post('/analytics/events', {
            event_type: eventType,
            metadata: metadata
        });
    } catch (error) {
        console.error('Failed to log event:', error);
        // Silently fail to not disrupt user experience
    }
};
