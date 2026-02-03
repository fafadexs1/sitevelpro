import { NextResponse } from "next/server";
import { mkdir, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

export async function POST(request: Request) {
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

    const uploadsRoot = path.join(process.cwd(), "public", "uploads", bucket);
    const fullPath = path.join(uploadsRoot, filePath);
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

    return NextResponse.json({ data: { path: filePath }, error: null });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: { message: error?.message || "Upload failed" } },
      { status: 500 },
    );
  }
}
