import { WebhookEvent } from "./github";

let webhookEvents: WebhookEvent[] = [];

export const webhookStorage = {
  add: (event: WebhookEvent) => {
    webhookEvents.unshift(event);
    if (webhookEvents.length > 200) {
      webhookEvents = webhookEvents.slice(0, 200);
    }
  },

  getAll: (): WebhookEvent[] => {
    return [...webhookEvents];
  },

  getByType: (type: string): WebhookEvent[] => {
    return webhookEvents.filter((event) => event.type === type);
  },

  getByRepository: (repository: string): WebhookEvent[] => {
    return webhookEvents.filter((event) => event.repository === repository);
  },

  getRecent: (limit: number = 50): WebhookEvent[] => {
    return webhookEvents.slice(0, limit);
  },

  clear: () => {
    webhookEvents = [];
  },

  count: (): number => {
    return webhookEvents.length;
  },

  getStats: () => {
    const stats: Record<string, number> = {};
    webhookEvents.forEach((event) => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    return stats;
  },
};
