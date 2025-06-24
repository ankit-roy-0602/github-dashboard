import { NextRequest, NextResponse } from "next/server";
import { webhookStorage } from "../../../lib/webhook-storage";
import { verifyWebhookSignature } from "../../../lib/webhook-verifier";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256") || "";
    const eventType = request.headers.get("x-github-event") || "";
    const deliveryId = request.headers.get("x-github-delivery") || "";

    const body = await request.json();
    const payload = JSON.stringify(body);
    const secret = process.env.WEBHOOK_SECRET;

    if (!secret) {
      console.error("WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { message: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    // Verify webhook signature
    if (signature && !verifyWebhookSignature(payload, signature, secret)) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    // Enhanced event processing for different webhook types
    const event = {
      id: uuidv4(),
      type: eventType,
      payload: body,
      timestamp: new Date().toISOString(),
      repository: body.repository?.full_name || "unknown",
      sender: body.sender?.login || "unknown",
      deliveryId,
    };

    // Special handling for pull request events with detailed information
    if (eventType === "pull_request") {
      const prPayload = body;
      event.payload = {
        ...prPayload,
        pr_summary: {
          action: prPayload.action,
          number: prPayload.number,
          title: prPayload.pull_request?.title,
          state: prPayload.pull_request?.state,
          draft: prPayload.pull_request?.draft,
          user: prPayload.pull_request?.user?.login,
          head_branch: prPayload.pull_request?.head?.ref,
          base_branch: prPayload.pull_request?.base?.ref,
          mergeable: prPayload.pull_request?.mergeable,
          mergeable_state: prPayload.pull_request?.mergeable_state,
          commits: prPayload.pull_request?.commits,
          additions: prPayload.pull_request?.additions,
          deletions: prPayload.pull_request?.deletions,
          changed_files: prPayload.pull_request?.changed_files,
          requested_reviewers:
            prPayload.pull_request?.requested_reviewers?.map(
              (r: any) => r.login,
            ) || [],
          labels: prPayload.pull_request?.labels?.map((l: any) => l.name) || [],
          milestone: prPayload.pull_request?.milestone?.title || null,
          html_url: prPayload.pull_request?.html_url,
          diff_url: prPayload.pull_request?.diff_url,
          patch_url: prPayload.pull_request?.patch_url,
          created_at: prPayload.pull_request?.created_at,
          updated_at: prPayload.pull_request?.updated_at,
        },
      };

      console.log(
        `PR ${prPayload.action} - #${prPayload.number}: ${prPayload.pull_request?.title}`,
      );
    }

    // Store the enhanced webhook event
    webhookStorage.add(event);

    console.log(`Received ${eventType} webhook event:`, {
      id: event.id,
      type: eventType,
      repository: event.repository,
      sender: event.sender,
      timestamp: event.timestamp,
    });

    return NextResponse.json({
      message: "Webhook received successfully",
      event_id: event.id,
      event_type: eventType,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
