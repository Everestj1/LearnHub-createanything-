import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function MainComponent({ params }) {
  const { id } = params;
  const { data: user, loading: userLoading } = useUser();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${id}`);
        if (!courseResponse.ok) {
          throw new Error("Course not found");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData.course);

        // Check if user is enrolled (if logged in)
        if (user) {
          const token = localStorage.getItem("supabase_token");
          if (token) {
            const enrollmentsResponse = await fetch("/api/enrollments", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (enrollmentsResponse.ok) {
              const enrollmentsData = await enrollmentsResponse.json();
              const enrolled = enrollmentsData.enrollments.some(
                (enrollment) => enrollment.course_id === parseInt(id),
              );
              setIsEnrolled(enrolled);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [id, user, userLoading]);

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
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <a href="/courses" className="text-[#357AFF] hover:text-[#2E69DE]">
            ← Back to Courses
          </a>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Course not found</div>
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
              <a href="/" className="text-2xl font-bold text-gray-900">
                LearnHub
              </a>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <a
                    href="/"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Courses
                  </a>
                  <a
                    href="/courses"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Courses
                  </a>
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <a
                    href="/account/logout"
                    className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E69DE]"
                  >
                    Sign Out
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </a>
                  <a
                    href="/courses"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Browse Courses
                  </a>
                  <a
                    href="/account/signin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </a>
                  <a
                    href="/account/signup"
                    className="bg-[#357AFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2E69DE]"
                  >
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
        {/* Breadcrumb */}
        <nav className="mb-8">
          <a href="/courses" className="text-[#357AFF] hover:text-[#2E69DE]">
            ← Back to Courses
          </a>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <div className="prose max-w-none">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {isEnrolled ? (
                  <div className="mt-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 text-green-600 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">
                            You're enrolled!
                          </h3>
                          <p className="text-green-700">
                            You have access to this course content.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Course Content Sections */}
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Course Content
                      </h2>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                              Module 1: Introduction
                            </h3>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">
                                Welcome to the course
                              </span>
                              <span className="text-sm text-gray-500">
                                5 min
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">
                                Course overview
                              </span>
                              <span className="text-sm text-gray-500">
                                10 min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                              Module 2: Getting Started
                            </h3>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">
                                Setting up your environment
                              </span>
                              <span className="text-sm text-gray-500">
                                15 min
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">
                                Your first project
                              </span>
                              <span className="text-sm text-gray-500">
                                20 min
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                              Module 3: Advanced Topics
                            </h3>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">
                                Best practices
                              </span>
                              <span className="text-sm text-gray-500">
                                25 min
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">
                                Real-world examples
                              </span>
                              <span className="text-sm text-gray-500">
                                30 min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Course Preview
                      </h3>
                      <p className="text-blue-700 mb-4">
                        This course includes comprehensive modules covering all
                        aspects of the topic. Enroll now to get full access to
                        all course materials, exercises, and resources.
                      </p>
                      {user ? (
                        <a
                          href="/courses"
                          className="inline-block bg-[#357AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2E69DE]"
                        >
                          Go to Courses to Enroll
                        </a>
                      ) : (
                        <a
                          href="/account/signin"
                          className="inline-block bg-[#357AFF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2E69DE]"
                        >
                          Sign In to Enroll
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#357AFF] mb-2">
                  ${course.price}
                </div>
                <div className="text-gray-600">One-time purchase</div>
              </div>

              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="flex items-center text-green-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Enrolled</span>
                  </div>
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
                    Continue Learning
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <a
                      href="/courses"
                      className="block w-full bg-[#357AFF] text-white py-3 rounded-lg font-medium text-center hover:bg-[#2E69DE]"
                    >
                      Enroll Now
                    </a>
                  ) : (
                    <a
                      href="/account/signin"
                      className="block w-full bg-[#357AFF] text-white py-3 rounded-lg font-medium text-center hover:bg-[#2E69DE]"
                    >
                      Sign In to Enroll
                    </a>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">
                  What's included:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Lifetime access
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Video lessons
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Practical exercises
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Certificate of completion
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainComponent;
