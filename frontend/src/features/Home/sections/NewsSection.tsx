import Container from "../../../components/Container";
import FeaturedNewsCard from "../componets/FeaturedNewsCard";
import NewsCard from "../componets/NewsCard";

const defaultNews = {
  featured: {
    title: "TOTC launches new career services and mentorship pathways",
    excerpt: "Introducing personalized career pathways, employer matchmaking, 1-on-1 resume clinics, and live practice interviews.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  },
  articles: [
    {
      id: "a1",
      title: "How TOTC students get hired fast in 2026",
      excerpt: "A deep dive into our placement support and active employer partnerships.",
    },
    {
      id: "a2",
      title: "Design systems that scale for modern web applications",
      excerpt: "How our UX curriculum teaches design system tokens through real projects.",
    },
    {
      id: "a3",
      title: "From zero coding knowledge to full-stack software engineer",
      excerpt: "A student story about the career switch process and real outcomes.",
    },
  ],
};

export default function NewsSection() {
  return (
    <section className="bg-white py-24">
      <Container className="space-y-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
            Latest News
          </p>
          <h2 className="mt-4 text-4xl font-extrabold text-slate-900">
            Stories and updates from the community
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FeaturedNewsCard
              title={defaultNews.featured.title}
              excerpt={defaultNews.featured.excerpt}
              image={defaultNews.featured.image}
            />
          </div>

          <div className="grid gap-4">
            {defaultNews.articles.map((a) => (
              <NewsCard key={a.id} title={a.title} excerpt={a.excerpt} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
