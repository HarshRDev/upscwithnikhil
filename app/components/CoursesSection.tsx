type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
};

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="relative group cursor-pointer">

      <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-0 group-hover:opacity-10 blur-xl transition duration-300"></div>

      <div className="relative bg-[#F8EFE2] border border-[#E5D5C3] rounded-2xl p-5 
      hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-[#0F172A]">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {course.description}
            </p>
          </div>

          <span className="text-sm font-semibold text-pink-500">
            ₹{course.price}
          </span>
        </div>

      </div>
    </div>
  );
}

export default function CoursesSection({ courses }: { courses: Course[] }) {
  return (
    <section className="mt-24 max-w-5xl mx-auto px-6">

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            ⭐ Featured Courses
          </h2>
          <p className="text-sm text-gray-500">
            Top picks for UPSC preparation
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}