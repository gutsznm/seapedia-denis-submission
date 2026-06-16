import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set("userId", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/"
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
