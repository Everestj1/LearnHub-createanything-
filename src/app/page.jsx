import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Fetch user enrollments
          const enrollmentsResponse = await fetch('/api/enrollments');
          if (enrollmentsResponse.ok) {
            const enrollmentsData = await enrollmentsResponse.json();
            setEnrollments(enrollmentsData.enrollments || []);
          }
        } else {
          // Fetch all courses for catalog
          const coursesResponse = await fetch('/api/courses');
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            setCourses(coursesData.courses || []);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LearnHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <a href="/courses" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Browse Courses
                  </a>
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <a href="/account/logout" className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E69DE]">
                    Sign Out
                  </a>
                </>
              ) : (
                <>
                  <a href="/courses" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Browse Courses
                  </a>
                  <a href="/account/signin" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </a>
                  <a href="/account/signup" className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E69DE]">
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          // Show user enrollments
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h2>
              <p className="text-gray-600">Continue learning with your enrolled courses</p>
            </div>

            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-4">Start learning by enrolling in a course</p>
                <a href="/courses" className="bg-[#357AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2E69DE]">
                  Browse Courses
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={enrollment.image_url} 
                      alt={enrollment.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{enrollment.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{enrollment.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </span>
                        <a 
                          href={`/courses/${enrollment.course_id}`}
                          className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E69DE]"
                        >
                          Continue Learning
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Show course catalog
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Learn New Skills</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our comprehensive courses designed to help you master new technologies and advance your career
              </p>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No courses available</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={course.image_url} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#357AFF]">${course.price}</span>
                        <a 
                          href={`/courses/${course.id}`}
                          className="bg-[#357AFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2E69DE]"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <a href="/courses" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800">
                View All Courses
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MainComponent;