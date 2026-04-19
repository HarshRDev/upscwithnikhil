type Article = {
  id: string;
  title: string;
  content: string | null;
  created_at?: string;
};

function excerpt(text: string | null | undefined, max = 140): string {
  if (!text) return "";
  const stripped = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= max) return stripped;
  return `${stripped.slice(0, max).trim()}…`;
}

function formatDate(iso: string | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function ArticleCard({ article }: { article: Article }) {
  const dateLabel = formatDate(article.created_at);

  return (
    <div className="relative group cursor-default h-full">
      <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-0 group-hover:opacity-10 blur-xl transition duration-300" />

      <div className="relative bg-[#F8EFE2] border border-[#E5D5C3] rounded-2xl p-5 h-full flex flex-col
      hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
        <div className="flex-1 min-h-0">
          {dateLabel && (
            <p className="text-xs font-medium text-gray-500 mb-2">{dateLabel}</p>
          )}
          <h3 className="text-lg font-semibold text-[#0F172A] leading-snug">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-4">
            {excerpt(article.content)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesSection({ articles }: { articles: Article[] }) {
  if (!articles?.length) {
    return null;
  }

  return (
    <section id="articles" className="mt-24 max-w-5xl mx-auto px-6 scroll-mt-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            📰 Latest Articles
          </h2>
          <p className="text-sm text-gray-500">
            Strategy, current affairs, and preparation tips
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
