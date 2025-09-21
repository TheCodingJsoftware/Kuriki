type Handler<T = any> = (payload: T) => void;

class EventBus {
    private map = new Map<string, Set<Handler>>();

    on<T>(event: string, handler: Handler<T>) {
        if (!this.map.has(event)) this.map.set(event, new Set());
        this.map.get(event)!.add(handler as Handler);
        return () => this.off(event, handler);
    }

    off<T>(event: string, handler: Handler<T>) {
        this.map.get(event)?.delete(handler as Handler);
    }

    emit<T>(event: string, payload: T) {
        this.map.get(event)?.forEach(h => h(payload));
    }
}

export const events = new EventBus();

// Well-known events
export const EVT_STATE_CHANGED = "state:changed";
export const EVT_GRADE_CHANGED = "grade:changed";
export const EVT_FILTERS_RESET = "filters:reset";
