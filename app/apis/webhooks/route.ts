import { NextResponse } from "next/server";
import { webhookStorage } from "../../../lib/webhook-storage";

export async function GET() {
  try {
    const events = webhookStorage.getAll();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching webhook events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    webhookStorage.clear();
    return NextResponse.json({ message: "All events cleared" });
  } catch (error) {
    console.error("Error clearing webhook events:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
