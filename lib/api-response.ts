import { NextResponse } from "next/server";

/**
 * Standardized error response format
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standardized success response format
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
) {
  return NextResponse.json(
    {
      ...(message && { message }),
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

