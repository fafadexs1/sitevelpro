import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/auth/middleware";

type Payload = {
  bucket: string;
  paths: string[];
};

export async function POST(request: Request) {
  // Require authentication
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

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

    // Sanitize bucket name
    const sanitizedBucket = bucket.replace(/\.\./g, '').replace(/[^a-zA-Z0-9_-]/g, '');
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", sanitizedBucket);

    await Promise.all(
      paths.map(async (filePath) => {
        try {
          // Sanitize each path
          const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\/+/, '');
          const fullPath = path.join(uploadsRoot, sanitizedPath);

          // Ensure path is within uploads directory
          if (!fullPath.startsWith(path.join(process.cwd(), "public", "uploads"))) {
            return; // Skip invalid paths
          }

          await unlink(fullPath);
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
