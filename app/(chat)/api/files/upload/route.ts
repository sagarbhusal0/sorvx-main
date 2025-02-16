import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Define your file validation schema
const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File type should be JPEG, PNG, or PDF",
      }
    ),
});

// Initialize the S3 client for Cloudflare R2
const s3 = new S3Client({
  region: process.env.R2_REGION, // e.g., "auto"
  endpoint: process.env.R2_ENDPOINT, // e.g., "https://<account-id>.r2.cloudflarestorage.com"
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY as string,
    secretAccessKey: process.env.R2_SECRET_KEY as string,
  },
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = file.name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET, // Your R2 bucket name
        Key: filename, // The file name (key) in R2
        Body: Buffer.from(fileBuffer), // Convert ArrayBuffer to Buffer
        ContentType: file.type, // Set the appropriate content type
      });

      const data = await s3.send(command);

      return NextResponse.json(data);
    } catch (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
