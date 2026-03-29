import Footer from "./Footer";
import Navbar from "./Navbar";
import CoursesSection from "./CoursesSection";

export default function HomePage({
  articles,
  courses,
}: {
  articles: any[];
  courses: any[];
}) {
  return (
    <main className="bg-[#F5EBDD] min-h-screen">

          {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="text-center max-w-4xl mx-auto mt-16 px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A]">
          Crack UPSC with{" "}
          <span className="bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Smart Strategy
          </span>
        </h1>
      </section>

      {/* ARTICLES */}
      <section className="mt-20 max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>

        <div className="space-y-4">
          {articles.map((article: any) => (
            <div key={article.id} className="p-5 bg-white rounded-xl shadow">
              <h3 className="text-lg font-semibold">{article.title}</h3>
              <p className="text-gray-600 mt-2">{article.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <CoursesSection courses={courses}/>

      {/* FOOTER */}
      <Footer />

    </main>
  );
}