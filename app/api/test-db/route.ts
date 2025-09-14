import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("healthsangini");
    
    // Test connection by getting users collection
    const users = await db.collection("users").find({}).limit(1).toArray();
    
    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connection successful",
      usersCount: users.length 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to connect to database" 
    }, { status: 500 });
  }
}