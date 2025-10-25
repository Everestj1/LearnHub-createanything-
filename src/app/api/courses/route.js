import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    // Use Supabase table access for better performance
    const courses = await sql
      .table("courses")
      .select(
        "id, title, description, price, image_url, created_at, updated_at",
      );

    return Response.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return Response.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
