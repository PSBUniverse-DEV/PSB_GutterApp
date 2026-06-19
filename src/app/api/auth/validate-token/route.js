/**
 * Token Validation Endpoint
 * POST /api/auth/validate-token
 * Validates session token and returns payload
 */

import { NextResponse } from 'next/server';
import { verifyToken, isTokenValid } from '@/core/auth/jwt.utils';
import { isSessionInvalidated } from '@/core/auth/session.service';
import { getPSBSessionCookieFromRequest } from '@/core/auth/cookies.utils';
import { getCORSHeaders } from '@/core/auth/cors.utils';

export async function GET(request) {
  try {
    // Get token from request
    const token = getPSBSessionCookieFromRequest(request);
    const corsHeaders = getCORSHeaders(request);

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No session token found' },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Verify token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { valid: false, error: error.message },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Check if token has been invalidated
    const invalidated = await isSessionInvalidated(token);
    if (invalidated) {
      return NextResponse.json(
        { valid: false, error: 'Session has been invalidated' },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Return token payload
    return NextResponse.json(
      {
        valid: true,
        payload: {
          userId: payload.userId,
          email: payload.email,
          fullName: payload.fullName,
          modules: payload.modules || [],
          roles: payload.roles || [],
          issuedAt: payload.issuedAt,
          expiresAt: payload.expiresAt,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      {
        status: 500,
        headers: getCORSHeaders(request),
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;
    const corsHeaders = getCORSHeaders(request);

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Verify token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { valid: false, error: error.message },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Check if token has been invalidated
    const invalidated = await isSessionInvalidated(token);
    if (invalidated) {
      return NextResponse.json(
        { valid: false, error: 'Session has been invalidated' },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Return token payload
    return NextResponse.json(
      {
        valid: true,
        payload: {
          userId: payload.userId,
          email: payload.email,
          fullName: payload.fullName,
          modules: payload.modules || [],
          roles: payload.roles || [],
          issuedAt: payload.issuedAt,
          expiresAt: payload.expiresAt,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      {
        status: 500,
        headers: getCORSHeaders(request),
      }
    );
  }
}

export async function OPTIONS(request) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: getCORSHeaders(request),
    }
  );
}
