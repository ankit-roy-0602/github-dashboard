import { NextRequest, NextResponse } from 'next/server';
import { webhookStorage } from '@/lib/webhook-storage';
import { verifyWebhookSignature } from '@/lib/webhook-verifier';
import { v4 as uuidv4 } from 'uuid';

// IMPORTANT: Named exports for App Router
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'GitHub Webhook endpoint is ready : '+request.url,
    timestamp: new Date().toISOString(),
    methods: ['GET']
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Webhook POST request received');
    
    const signature = request.headers.get('x-hub-signature-256') || '';
    const eventType = request.headers.get('x-github-event') || '';
    const deliveryId = request.headers.get('x-github-delivery') || '';
    
    console.log('📋 Event details:', { eventType, deliveryId });
    
    const body = await request.json();
    const payload = JSON.stringify(body);
    const secret = process.env.WEBHOOK_SECRET;

    if (!secret) {
      console.error('❌ WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { message: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature if provided
    if (signature) {
      if (!verifyWebhookSignature(payload, signature, secret)) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json(
          { message: 'Invalid signature' },
          { status: 401 }
        );
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ No signature provided - webhook not secured');
    }

    // Enhanced event processing
    const event = {
      id: uuidv4(),
      type: eventType,
      payload: body,
      timestamp: new Date().toISOString(),
      repository: body.repository?.full_name || 'unknown',
      sender: body.sender?.login || 'unknown',
      deliveryId,
    };

    // Special handling for pull request events
    if (eventType === 'pull_request') {
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
          requested_reviewers: prPayload.pull_request?.requested_reviewers?.map((r: any) => r.login) || [],
          labels: prPayload.pull_request?.labels?.map((l: any) => l.name) || [],
          milestone: prPayload.pull_request?.milestone?.title || null,
          html_url: prPayload.pull_request?.html_url,
          diff_url: prPayload.pull_request?.diff_url,
          patch_url: prPayload.pull_request?.patch_url,
          created_at: prPayload.pull_request?.created_at,
          updated_at: prPayload.pull_request?.updated_at,
        }
      };

      console.log(`🔄 PR ${prPayload.action} - #${prPayload.number}: ${prPayload.pull_request?.title}`);
    }

    // Store the webhook event
    webhookStorage.add(event);

    console.log(`✅ Webhook processed successfully:`, {
      id: event.id,
      type: eventType,
      repository: event.repository,
      sender: event.sender,
    });

    return NextResponse.json({ 
      message: 'Webhook received successfully',
      event_id: event.id,
      event_type: eventType,
      timestamp: event.timestamp,
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { message: 'Method not allowed : '+request.method },
    { status: 405 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { message: 'Method not allowed : '+request.method },
    { status: 405 }
  );
}