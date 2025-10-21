import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { UserService } from "@/server/modules/users/services/users.service";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const ds = await getDataSource();
    const svc = new UserService(ds);

    const ok = await svc.restore(params.id);
    if (!ok)
      return NextResponse.json({ error: "User not found or not deleted" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ restore user error:", err);
    return NextResponse.json({ error: err?.message ?? "Server Error" }, { status: 500 });
  }
}
