import Footer from "./Footer";
import Navbar from "./Navbar";
import ArticlesSection from "./ArticlesSection";
import CoursesSection from "./CoursesSection";

type Article = {
  id: string;
  title: string;
  content: string | null;
  created_at?: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export default function HomePage({
  articles,
  courses,
}: {
  articles: Article[];
  courses: Course[];
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

      <ArticlesSection articles={articles} />

      {/* COURSES */}
      <CoursesSection courses={courses}/>

      {/* FOOTER */}
      <Footer />

    </main>
  );
}