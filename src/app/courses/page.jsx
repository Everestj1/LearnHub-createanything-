import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function PurchaseModal({ course, isOpen, onClose, onPurchase }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("supabase_token");

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          customerDetails: formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Purchase failed");
      }

      const data = await response.json();
      onPurchase(data);
      onClose();

      // Redirect to course page
      window.location.href = `/courses/${course.id}`;
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Purchase Course
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {course.title}
            </h3>
            <p className="text-2xl font-bold text-[#357AFF]">${course.price}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#357AFF] focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#357AFF] text-white rounded-lg hover:bg-[#2E69DE] disabled:opacity-50"
              >
                {loading ? "Processing..." : "Purchase Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all courses
        const coursesResponse = await fetch("/api/courses");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses || []);
        }

        // Fetch user enrollments if logged in
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
              setEnrollments(enrollmentsData.enrollments || []);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchData();
    }
  }, [user, userLoading]);

  const handleBuyCourse = (course) => {
    if (!user) {
      window.location.href = "/account/signin";
      return;
    }

    setSelectedCourse(course);
    setShowPurchaseModal(true);
  };

  const handlePurchaseComplete = (data) => {
    // Refresh enrollments
    setEnrollments((prev) => [...prev, data.enrollment]);
  };

  const isEnrolled = (courseId) => {
    return enrollments.some((enrollment) => enrollment.course_id === courseId);
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-600">
            Explore our comprehensive course catalog
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No courses available</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#357AFF]">
                      ${course.price}
                    </span>
                    {isEnrolled(course.id) ? (
                      <a
                        href={`/courses/${course.id}`}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
                      >
                        View Course
                      </a>
                    ) : (
                      <button
                        onClick={() => handleBuyCourse(course)}
                        className="bg-[#357AFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2E69DE]"
                      >
                        Buy Course
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Purchase Modal */}
      {selectedCourse && (
        <PurchaseModal
          course={selectedCourse}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedCourse(null);
          }}
          onPurchase={handlePurchaseComplete}
        />
      )}
    </div>
  );
}

export default MainComponent;
