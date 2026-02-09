import { NextResponse } from "next/server";
import { mkdir, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/auth/middleware";

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.mp4', '.webm'];

export async function POST(request: Request) {
  // Require authentication
  const auth = await requireAuth(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = String(formData.get("bucket") || "");
    const filePath = String(formData.get("path") || "");
    const upsert = formData.get("upsert") === "true";

    if (!file || !bucket || !filePath) {
      return NextResponse.json(
        { data: null, error: { message: "Missing file, bucket or path" } },
        { status: 400 },
      );
    }

    // Validate file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { data: null, error: { message: `File type ${ext} not allowed` } },
        { status: 400 },
      );
    }

    // Sanitize path to prevent directory traversal
    const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\/+/, '');
    const sanitizedBucket = bucket.replace(/\.\./g, '').replace(/[^a-zA-Z0-9_-]/g, '');

    const uploadsRoot = path.join(process.cwd(), "public", "uploads", sanitizedBucket);
    const fullPath = path.join(uploadsRoot, sanitizedPath);

    // Ensure the path is still within uploads directory
    if (!fullPath.startsWith(path.join(process.cwd(), "public", "uploads"))) {
      return NextResponse.json(
        { data: null, error: { message: "Invalid path" } },
        { status: 400 },
      );
    }

    await mkdir(path.dirname(fullPath), { recursive: true });

    if (!upsert) {
      try {
        await access(fullPath, fsConstants.F_OK);
        return NextResponse.json(
          { data: null, error: { message: "File already exists" } },
          { status: 409 },
        );
      } catch {
        // File does not exist, continue.
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(arrayBuffer));

    return NextResponse.json({ data: { path: sanitizedPath }, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: { message: error?.message || "Upload failed" } },
      { status: 500 },
    );
  }
}
