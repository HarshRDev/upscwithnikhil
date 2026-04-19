import HomePage from "./components/HomePage";
import { getAppBaseUrl } from "./lib/appBaseUrl";

async function getArticles() {
  const base = await getAppBaseUrl();
  const res = await fetch(`${base}/api/articles`, {
    cache: "no-store",
  });
  return res.json();
}

async function getCourses() {
  const base = await getAppBaseUrl();
  const res = await fetch(`${base}/api/courses`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Page() {
  const articles = await getArticles();
  const courses = await getCourses();

  return <HomePage articles={articles} courses={courses} />;
}