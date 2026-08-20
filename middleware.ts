import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_TOKEN_COOKIE = "access_token";

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    // algorithms wajib dibatasi eksplisit ke HS256 — konsisten sama
    // jwt.SigningMethodHS256 yang dipakai di pkg/jwt/jwt.go backend.
    // jwtVerify otomatis nolak token yang exp-nya sudah lewat.
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const valid = token ? await isTokenValid(token) : false;

  if (!valid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    // Bersihkan cookie basi/invalid dari browser biar tidak nyangkut
    // terus-terusan gagal verify tiap request.
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*"],
};