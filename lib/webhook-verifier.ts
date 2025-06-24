import crypto from "crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = `sha256=${hmac.digest("hex")}`;

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

export function validateWebhookPayload(payload: any): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const hasValidStructure =
    payload.hasOwnProperty("zen") ||
    payload.hasOwnProperty("repository") ||
    payload.hasOwnProperty("sender") ||
    payload.hasOwnProperty("action");

  return hasValidStructure;
}

export function sanitizeWebhookPayload(payload: any): any {
  // Remove sensitive information from webhook payloads before storing
  const sensitiveFields = [
    "installation.access_tokens_url",
    "installation.repositories_url",
    "sender.gravatar_id",
    "repository.ssh_url",
    "repository.clone_url",
    "repository.git_url",
    "repository.private_clone_url",
  ];

  const sanitized = JSON.parse(JSON.stringify(payload));

  sensitiveFields.forEach((field) => {
    const keys = field.split(".");
    let obj = sanitized;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj && obj[keys[i]]) {
        obj = obj[keys[i]];
      } else {
        break;
      }
    }
    if (obj && obj[keys[keys.length - 1]]) {
      delete obj[keys[keys.length - 1]];
    }
  });

  return sanitized;
}

export function extractWebhookMetadata(payload: any, eventType: string) {
  const metadata: any = {
    eventType,
    timestamp: new Date().toISOString(),
    repository: payload.repository?.full_name || "unknown",
    sender: payload.sender?.login || "unknown",
  };

  // Add event-specific metadata
  switch (eventType) {
    case "push":
      metadata.branch = payload.ref?.replace("refs/heads/", "");
      metadata.commits = payload.commits?.length || 0;
      metadata.forced = payload.forced || false;
      break;

    case "pull_request":
      metadata.prNumber = payload.number;
      metadata.prAction = payload.action;
      metadata.prState = payload.pull_request?.state;
      metadata.prTitle = payload.pull_request?.title;
      metadata.prUser = payload.pull_request?.user?.login;
      break;

    case "issues":
      metadata.issueNumber = payload.issue?.number;
      metadata.issueAction = payload.action;
      metadata.issueState = payload.issue?.state;
      metadata.issueTitle = payload.issue?.title;
      metadata.issueUser = payload.issue?.user?.login;
      break;

    case "pull_request_review":
      metadata.prNumber = payload.pull_request?.number;
      metadata.reviewAction = payload.action;
      metadata.reviewState = payload.review?.state;
      metadata.reviewer = payload.review?.user?.login;
      break;

    case "star":
      metadata.starAction = payload.action;
      metadata.starredAt = payload.starred_at;
      break;

    case "watch":
      metadata.watchAction = payload.action;
      break;

    case "release":
      metadata.releaseAction = payload.action;
      metadata.releaseName = payload.release?.name;
      metadata.releaseTag = payload.release?.tag_name;
      metadata.releasePrerelease = payload.release?.prerelease;
      break;

    case "security_advisory":
      metadata.advisoryAction = payload.action;
      metadata.advisoryId = payload.security_advisory?.ghsa_id;
      metadata.advisorySeverity = payload.security_advisory?.severity;
      break;

    case "repository_vulnerability_alert":
      metadata.alertAction = payload.action;
      metadata.alertNumber = payload.alert?.number;
      metadata.alertState = payload.alert?.state;
      break;
  }

  return metadata;
}

export function validateGitHubWebhook(
  payload: string,
  signature: string,
  secret: string,
  eventType: string,
): { isValid: boolean; error?: string } {
  // Validate signature
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return { isValid: false, error: "Invalid signature" };
  }

  // Parse payload
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch (error) {
    console.error("Error parsing webhook payload:", error);
    return { isValid: false, error: "Invalid JSON payload" };
  }

  // Validate payload structure
  if (!validateWebhookPayload(parsedPayload)) {
    return { isValid: false, error: "Invalid payload structure" };
  }

  // Validate event type
  const validEventTypes = [
    "push",
    "pull_request",
    "pull_request_review",
    "pull_request_review_comment",
    "issues",
    "issue_comment",
    "star",
    "watch",
    "fork",
    "release",
    "repository",
    "security_advisory",
    "repository_vulnerability_alert",
    "dependabot_alert",
    "code_scanning_alert",
    "secret_scanning_alert",
    "ping",
  ];

  if (!validEventTypes.includes(eventType)) {
    return { isValid: false, error: `Unsupported event type: ${eventType}` };
  }

  return { isValid: true };
}

export function generateWebhookResponse(
  success: boolean,
  eventId?: string,
  eventType?: string,
  error?: string,
) {
  if (success) {
    return {
      status: "success",
      message: "Webhook processed successfully",
      eventId,
      eventType,
      timestamp: new Date().toISOString(),
    };
  } else {
    return {
      status: "error",
      message: error || "Failed to process webhook",
      timestamp: new Date().toISOString(),
    };
  }
}

export function isWebhookEventDuplicate(
  eventId: string,
  deliveryId: string,
  existingEvents: any[],
): boolean {
  return existingEvents.some(
    (event) => event.id === eventId || event.deliveryId === deliveryId,
  );
}

export function rateLimitWebhook(
  maxEvents: number = 100,
): { allowed: boolean; remaining: number } {

  // This would typically be stored in a persistent cache
  // For demo purposes, we'll just return allowed
  return { allowed: true, remaining: maxEvents };
}

// Type definitions for webhook verification
export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: any;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  repository?: string;
  sender?: string;
  deliveryId?: string;
  signature?: string;
  metadata?: any;
}

// Utility function to create a standardized webhook event
export function createWebhookEvent(
  eventType: string,
  payload: any,
  deliveryId: string,
  signature?: string,
): WebhookEvent {
  const sanitizedPayload = sanitizeWebhookPayload(payload);
  const metadata = extractWebhookMetadata(payload, eventType);

  return {
    id: crypto.randomUUID(),
    type: eventType,
    payload: sanitizedPayload,
    timestamp: new Date().toISOString(),
    repository: payload.repository?.full_name || "unknown",
    sender: payload.sender?.login || "unknown",
    deliveryId,
    signature,
    metadata,
  };
}
