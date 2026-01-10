import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "12", 10);
        const skip = (page - 1) * limit;

        const db = await getDb();
        const collection = db.collection("base_locations");

        const query = { status: "approved" };

        const totalVideos = await collection.countDocuments(query);
        const images = await collection.find(query)
            .sort({ _id: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .toArray();

        // Transform data for frontend
        const formattedImages = images.map(img => ({
            id: img._id.toString(),
            imageUrl: img.image,
            buildingName: img.building || "Unknown Location",
            stats: {
                mostAccurate: img.mostAccurate_allTime ? {
                    username: img.mostAccurate_allTime.username,
                    distance: img.mostAccurate_allTime.distance,
                    score: img.mostAccurate_allTime.score
                } : null,
                fastestTime: img.fastestCorrect_allTime ? {
                    username: img.fastestCorrect_allTime.username,
                    time: img.fastestCorrect_allTime.responseTime
                } : null,
                totalGuesses: img.totalGuesses || 0,
                averageDistance: img.averageDistance || 0
            }
        }));

        return NextResponse.json({
            images: formattedImages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalVideos / limit),
                totalImages: totalVideos
            }
        });

    } catch (error) {
        console.error("[HallOfFame API] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}
