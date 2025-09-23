import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  // Setup database variables
  const db = await getDb();
  const collection = db.collection("posters");

  try {
    // Check Cloudinary configuration
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Missing Cloudinary environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const posterFile = formData.get("posterFile") as File;
    const description = formData.get("description") as string;
    const eventDateTime = formData.get("eventDateTime") as string;
    const posterType = formData.get("posterType") as string;
    const categories = formData.get("categories") as string;

    const categoryList =
      !categories || categories.length === 0 ? null : categories?.split(",");

    console.log({
      name,
      posterFile: posterFile
        ? {
            name: posterFile.name,
            size: posterFile.size,
            type: posterFile.type,
          }
        : null,
      description,
      eventDateTime,
    });

    // Validate required fields
    if (!name || !posterFile || !description) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Upload image to cloud storage and retrieve URL
    const fileBuffer = await posterFile.arrayBuffer();

    const uploadResult = await Promise.race([
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "posters",
            timeout: 60000, // 60 second timeout
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload result:", result?.secure_url);
              resolve(result);
            }
          }
        );

        // Send the file buffer to the upload stream
        uploadStream.end(Buffer.from(fileBuffer));
      }),
      // Timeout after 30 seconds
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout")), 30000)
      ),
    ]);

    // Insert to database
    const insertResult = await collection.insertOne({
      name,
      posterUrl: (uploadResult as any).secure_url,
      description,
      eventDateTime: eventDateTime ? new Date(eventDateTime) : null,
      createdAt: new Date(),
      posterType: posterType,
      categories: categoryList,
      show: false, // Posters are hidden by default until reviewed
    });

    console.log("Database insert result:", insertResult);

    return new Response(
      JSON.stringify({
        message: "Poster added successfully",
        id: insertResult.insertedId,
        imageUrl: (uploadResult as any).secure_url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing poster submission:", error);

    if (error instanceof Error && error.message === "Upload timeout") {
      return new Response(
        JSON.stringify({
          error: "Image upload timed out. Please try with a smaller image.",
        }),
        { status: 408 }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
