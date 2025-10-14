export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/server/modules/users/services/users.service";

type CountQuery = {
  role?: string;
  isDeleted?: string | undefined;
};

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const role = sp.get("role") ?? undefined;
    const isDeleted = sp.get("isDeleted") ?? undefined;
    const svc = new UserService();
    const result = await svc.getUserCount({
      role,
      isDeleted,
    } satisfies CountQuery);
    return NextResponse.json(result, {
      status: result.status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: 500, message: "server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
