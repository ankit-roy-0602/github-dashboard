"use client";

import React, { useState, useEffect } from "react";
import WebhookEventComponent from "@/components/WebhookEvent";
import { WebhookEvent } from "@/lib/github";
import {
  Trash2,
  RefreshCw,
  Webhook,
  AlertCircle,
  Filter,
  GitPullRequest,
  GitCommit,
  Eye,
  TrendingUp,
  Activity,
  Shield,
} from "lucide-react";

export default function Webhooks() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/webhooks");
      if (!response.ok) throw new Error("Failed to fetch webhook events");
      const data = await response.json();
      setEvents(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const clearEvents = async () => {
    try {
      const response = await fetch("/api/webhooks", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear events");
      setEvents([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear events");
    }
  };

  useEffect(() => {
    fetchEvents();
    // Poll for new events every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter events by type
  const filteredEvents = events.filter((event) => {
    if (eventTypeFilter === "all") return true;
    return event.type === eventTypeFilter;
  });

  // Get unique event types for filter
  const eventTypes = Array.from(new Set(events.map((event) => event.type)));

  // Calculate event statistics
  const eventStats = events.reduce(
    (acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get repository statistics
  const repositoryStats = events.reduce(
    (acc, event) => {
      if (event.repository) {
        acc[event.repository] = (acc[event.repository] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topRepositories = Object.entries(repositoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "pull_request":
        return <GitPullRequest className="h-4 w-4 text-blue-500" />;
      case "push":
        return <GitCommit className="h-4 w-4 text-green-500" />;
      case "pull_request_review":
        return <Eye className="h-4 w-4 text-purple-500" />;
      case "issues":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "star":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case "watch":
        return <Eye className="h-4 w-4 text-indigo-500" />;
      case "security_advisory":
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Webhook className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-github-900">
              Webhook Events
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchEvents}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={clearEvents}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Event Statistics Grid */}
        {Object.keys(eventStats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {Object.entries(eventStats).map(([type, count]) => (
              <div
                key={type}
                className="bg-github-50 rounded-lg p-3 border hover:bg-github-100 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getEventIcon(type)}
                  <span className="text-xs font-medium text-github-600 capitalize truncate">
                    {type.replace("_", " ")}
                  </span>
                </div>
                <p className="text-lg font-bold text-github-900">{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top Repositories */}
        {topRepositories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-github-900 mb-3">
              Most Active Repositories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {topRepositories.map(([repo, count]) => (
                <div
                  key={repo}
                  className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                >
                  <p className="text-sm font-medium text-blue-900 truncate">
                    {repo}
                  </p>
                  <p className="text-lg font-bold text-blue-700">
                    {count} events
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Type Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="h-5 w-5 text-github-500" />
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-4 py-2 border border-github-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Event Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
              </option>
            ))}
          </select>
          <span className="text-sm text-github-500">
            Showing {filteredEvents.length} of {events.length} events
          </span>
        </div>

        {/* Webhook Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">
                Webhook Setup Instructions
              </h3>
              <p className="text-blue-800 text-sm mt-1">
                To receive webhook events, configure your GitHub repository
                webhooks to point to:
              </p>
              <code className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-sm mt-2 inline-block break-all">
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "https://your-domain.com"}
                /api/webhook
              </code>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-800 text-sm font-medium">
                    Recommended Events:
                  </p>
                  <ul className="text-blue-800 text-sm mt-1 space-y-1">
                    <li>• Pull requests (opens, closes, synchronize)</li>
                    <li>• Pull request reviews (submitted, edited)</li>
                    <li>• Push events (commits to branches)</li>
                    <li>• Issues (opened, closed, edited)</li>
                    <li>• Repository (starred, watched)</li>
                    <li>• Security alerts (vulnerability alerts)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-blue-800 text-sm font-medium">
                    Configuration:
                  </p>
                  <ul className="text-blue-800 text-sm mt-1 space-y-1">
                    <li>
                      • Content type: <code>application/json</code>
                    </li>
                    <li>• Secret: Use your webhook secret</li>
                    <li>• SSL verification: Enable</li>
                    <li>• Active: Enable</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-github-600">
            {filteredEvents.length === 0
              ? "No webhook events received yet"
              : `${filteredEvents.length} events received`}
          </p>
          {filteredEvents.length > 0 && (
            <span className="text-sm text-github-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-900 mx-auto"></div>
          <p className="mt-4 text-github-600">Loading webhook events...</p>
        </div>
      ) : (
        <>
          {/* Webhook Events List */}
          {filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <WebhookEventComponent key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <Webhook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-github-900 mb-2">
                  No Webhook Events
                </h3>
                <p className="text-github-500 mb-4">
                  {eventTypeFilter === "all"
                    ? "No webhook events have been received yet. Configure your repository webhooks to start receiving events."
                    : `No ${eventTypeFilter.replace("_", " ")} events found.`}
                </p>
                {eventTypeFilter !== "all" && (
                  <button
                    onClick={() => setEventTypeFilter("all")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Show All Events
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
