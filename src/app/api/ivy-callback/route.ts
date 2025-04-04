import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

// Disable Next.js body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Get raw body as a buffer
    const rawBody = await req.text(); // Use .text() to get raw string
    const signature = req.headers.get("X-Ivy-Signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing X-Ivy-Signature header" },
        { status: 401 }
      );
    }

    // Verify signature
    const webhookSecret = process.env.IVY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("IVY_WEBHOOK_SECRET not set in environment");
    }

    const computedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (computedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the body now that it’s verified
    const event = JSON.parse(rawBody);

    // Handle the event
    switch (event.type) {
      case "test":
        console.log("Received test webhook:", event.data.message);
        // In a real app, you might log this to a database or trigger a notification
        break;
      default:
        console.log("Unhandled event type:", event.type);
        console.log("Event data", event.id, event.payload);
      // Add cases for other events (e.g., "payment.succeeded") as needed
    }

    // Respond with 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
