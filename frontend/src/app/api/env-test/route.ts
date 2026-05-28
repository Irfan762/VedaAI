import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    MONGO_URI: process.env.MONGO_URI || null,
    REDIS_URL: process.env.REDIS_URL || null,
    CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL || null,
    API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
    // Note: PORT is provided by Render automatically; we expose it for debugging only.
    PORT: process.env.PORT || null,
  };
  return NextResponse.json(data);
}
