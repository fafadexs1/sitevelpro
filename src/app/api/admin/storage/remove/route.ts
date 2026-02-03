import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";

type Payload = {
  bucket: string;
  paths: string[];
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const bucket = payload.bucket;
    const paths = payload.paths ?? [];

    if (!bucket || !Array.isArray(paths)) {
      return NextResponse.json(
        { data: null, error: { message: "Missing bucket or paths" } },
        { status: 400 },
      );
    }

    const uploadsRoot = path.join(process.cwd(), "public", "uploads", bucket);
    await Promise.all(
      paths.map(async (filePath) => {
        try {
          await unlink(path.join(uploadsRoot, filePath));
        } catch {
          // Ignore missing files
        }
      }),
    );

    return NextResponse.json({ data: null, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: { message: error?.message || "Remove failed" } },
      { status: 500 },
    );
  }
}
