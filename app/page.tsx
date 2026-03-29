import HomePage from "./components/HomePage";

async function getArticles() {
  const res = await fetch("http://localhost:3000/api/articles", {
    cache: "no-store",
  });
  return res.json();
}

async function getCourses() {
  const res = await fetch("http://localhost:3000/api/courses", {
    cache: "no-store",
  });
  return res.json();
}

export default async function Page() {
  const articles = await getArticles();
  const courses = await getCourses();

  return <HomePage articles={articles} courses={courses} />;
}