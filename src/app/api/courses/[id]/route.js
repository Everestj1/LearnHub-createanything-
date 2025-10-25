import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Use Supabase table access
    const courses = await sql
      .table("courses")
      .select("*", { id: parseInt(id) });

    if (courses.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    return Response.json({ course: courses[0] });
  } catch (error) {
    console.error("Error fetching course:", error);
    return Response.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}
