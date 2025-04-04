import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Checkout req body", body);
  const response = await fetch(
    `${process.env.IVY_API_URL}/api/service/checkout/session/create`,
    {
      method: "POST",
      headers: {
        "X-Ivy-Api-Key": process.env.IVY_API_KEY!, // Store in .env.local
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = await response.json();
  return NextResponse.json(data);
}
