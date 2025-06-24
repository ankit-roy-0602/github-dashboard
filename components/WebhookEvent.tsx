"use client";

import React, { useState } from "react";
import { WebhookEvent } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";
import {
  GitCommit,
  GitPullRequest,
  Star,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Plus,
  Minus,
  Shield,
  Activity,
} from "lucide-react";

interface WebhookEventProps {
  event: WebhookEvent;
}

const WebhookEventComponent: React.FC<WebhookEventProps> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "push":
        return <GitCommit className="h-5 w-5 text-green-600" />;
      case "pull_request":
        return <GitPullRequest className="h-5 w-5 text-blue-600" />;
      case "pull_request_review":
        return <Eye className="h-5 w-5 text-purple-600" />;
      case "issues":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "star":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "watch":
        return <Eye className="h-5 w-5 text-purple-600" />;
      case "security_advisory":
        return <Shield className="h-5 w-5 text-red-600" />;
      case "repository_vulnerability_alert":
        return <Shield className="h-5 w-5 text-orange-600" />;
      default:
        return <Activity className="h-5 w-5 text-github-600" />;
    }
  };

  const getEventDescription = (type: string, payload: any) => {
    switch (type) {
      case "push":
        const pushSummary = payload.push_summary;
        return `Pushed ${pushSummary?.commits_count || 0} commits to ${pushSummary?.branch || "unknown branch"}`;
      case "pull_request":
        const prSummary = payload.pr_summary;
        return `${prSummary?.action || "Updated"} pull request #${prSummary?.number || "unknown"}: ${prSummary?.title || "No title"}`;
      case "pull_request_review":
        const reviewSummary = payload.review_summary;
        return `${reviewSummary?.action || "Updated"} review for PR #${reviewSummary?.pr_number || "unknown"} - ${reviewSummary?.review_state || "unknown state"}`;
      case "issues":
        const issueSummary = payload.issue_summary;
        return `${issueSummary?.action || "Updated"} issue #${issueSummary?.number || "unknown"}: ${issueSummary?.title || "No title"}`;
      case "star":
        return `${payload.action || "Updated"} star`;
      case "watch":
        return `${payload.action || "Updated"} watch`;
      default:
        return `${type} event`;
    }
  };

  const renderPullRequestDetails = () => {
    if (event.type !== "pull_request" || !event.payload.pr_summary) return null;

    const pr = event.payload.pr_summary;

    return (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-github-600">
                State:
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  pr.state === "open"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {pr.state}
                {pr.draft && " (Draft)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-github-600">
                Author:
              </span>
              <span className="text-sm text-github-900">{pr.user}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-github-600">
                Branches:
              </span>
              <span className="text-sm text-github-900">
                {pr.head_branch} → {pr.base_branch}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {pr.commits !== undefined && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <GitCommit className="h-4 w-4 text-github-500" />
                  <span>{pr.commits} commits</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Plus className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">{pr.additions}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Minus className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">{pr.deletions}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4 text-sm">
          {pr.html_url && (
            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View PR
            </a>
          )}
          {pr.diff_url && (
            <a
              href={pr.diff_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Diff
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">{getEventIcon(event.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-github-900">
                  {event.type.charAt(0).toUpperCase() +
                    event.type.slice(1).replace("_", " ")}{" "}
                  Event
                </h3>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-2 p-1 text-github-400 hover:text-github-600"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-github-600 mt-1">
                {getEventDescription(event.type, event.payload)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-4 text-xs text-github-500">
                  <span>Repository: {event.repository}</span>
                  <span>Sender: {event.sender}</span>
                </div>
                <span className="text-xs text-github-500">
                  {formatDistanceToNow(new Date(event.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            {event.type === "pull_request" && renderPullRequestDetails()}

            <details className="mt-4">
              <summary className="text-xs text-github-500 cursor-pointer hover:text-github-700">
                View Raw Payload
              </summary>
              <pre className="mt-2 text-xs bg-github-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookEventComponent;
