import sql from "@/app/api/utils/sql";
import { supabaseAuth } from "@/app/api/utils/supabase";

// Helper function to get authenticated user
async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const user = await supabaseAuth.getUser(token);
    return user
      ? {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
        }
      : null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Supabase table access with join-like query
    const enrollments = await sql`
      SELECT 
        ce.id,
        ce.enrolled_at,
        ce.payment_status,
        c.id as course_id,
        c.title,
        c.description,
        c.price,
        c.image_url
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.user_id = ${user.id}
      ORDER BY ce.enrolled_at DESC
    `;

    return Response.json({ enrollments });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return Response.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, customerDetails } = body;

    if (!courseId) {
      return Response.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Check if course exists
    const courses = await sql`
      SELECT id, title, price FROM courses WHERE id = ${courseId} LIMIT 1
    `;

    if (courses.length === 0) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is already enrolled
    const existingEnrollment = await sql`
      SELECT id FROM course_enrollments 
      WHERE user_id = ${user.id} AND course_id = ${courseId}
      LIMIT 1
    `;

    if (existingEnrollment.length > 0) {
      return Response.json(
        { error: "Already enrolled in this course" },
        { status: 400 },
      );
    }

    // Save customer details if provided
    if (customerDetails) {
      const { fullName, phone, address, city, state, zipCode, country } =
        customerDetails;

      await sql`
        INSERT INTO customer_details (user_id, full_name, phone, address, city, state, zip_code, country)
        VALUES (${user.id}, ${fullName}, ${phone}, ${address}, ${city}, ${state}, ${zipCode}, ${country})
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          zip_code = EXCLUDED.zip_code,
          country = EXCLUDED.country,
          updated_at = CURRENT_TIMESTAMP
      `;
    }

    // Create enrollment
    const enrollment = await sql`
      INSERT INTO course_enrollments (user_id, course_id, payment_status)
      VALUES (${user.id}, ${courseId}, 'completed')
      RETURNING id, enrolled_at, payment_status
    `;

    return Response.json({
      enrollment: enrollment[0],
      course: courses[0],
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return Response.json(
      { error: "Failed to create enrollment" },
      { status: 500 },
    );
  }
}
