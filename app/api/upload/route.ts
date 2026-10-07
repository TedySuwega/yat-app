import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files (JPEG, PNG, WebP, AVIF) are allowed." },
        { status: 400 }
      );
    }

    // Limit to 10MB input file
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum image size is 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Optimize and resize image using Sharp (1200x800 WebP format for optimal performance)
    const optimizedBuffer = await sharp(inputBuffer)
      .resize(1200, 800, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `img-${Date.now()}-${nanoid(6)}.webp`;
    let fileUrl = `/uploads/${filename}`;

    try {
      const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      const targetPath = path.join(publicUploadsDir, filename);
      await fs.promises.writeFile(targetPath, optimizedBuffer);
    } catch (fsErr) {
      // On serverless read-only platforms (such as Vercel), public/ folder cannot be written at runtime.
      // Gracefully fall back to returning an inline Base64 WebP Data URL for immediate display and preview.
      console.warn("[UPLOAD WARN] Persistent disk write not supported in current runtime, serving as Base64 Data URL:", fsErr);
      const base64Data = optimizedBuffer.toString("base64");
      fileUrl = `data:image/webp;base64,${base64Data}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
      width: 1200,
      height: 800,
      size: optimizedBuffer.length,
      format: "webp",
    });
  } catch (err: any) {
    console.error("[UPLOAD ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
