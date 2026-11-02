import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

type BlogSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
};

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isBlogSection(value: unknown): value is BlogSection {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const section = value as Record<string, unknown>;

  return (
    (section.heading === undefined || typeof section.heading === "string") &&
    (section.paragraphs === undefined ||
      (Array.isArray(section.paragraphs) &&
        section.paragraphs.every(
          (paragraph) => typeof paragraph === "string",
        ))) &&
    (section.list === undefined ||
      (Array.isArray(section.list) &&
        section.list.every((item) => typeof item === "string")))
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      published: true,
      contentType: "BLOG",
    },
    select: {
      title: true,
      excerpt: true,
    },
  });

  if (!post) {
    return {
      title: "Article Not Found | Deora",
      description: "This article could not be found.",
    };
  }

  return {
    title: `${post.title} | Deora`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      published: true,
      contentType: "BLOG",
    },
  });

  if (!post) {
    notFound();
  }

  const sections: BlogSection[] = Array.isArray(post.sections)
    ? post.sections.filter(isBlogSection)
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950 hover:underline"
      >
        <span aria-hidden="true">←</span>
        Back to Blog
      </Link>

      <article className="mt-8">
        <header>
          <p className="text-sm text-gray-500">
            {formatDate(post.date)} <span aria-hidden="true">·</span>{" "}
            {post.readTime}
          </p>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-green-950 md:text-5xl">
            {post.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-600">{post.excerpt}</p>
        </header>

        {post.image && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10 space-y-8">
          {sections.map((section, index) => (
            <section key={index} className="space-y-4">
              {section.heading && (
                <h2 className="text-2xl font-bold leading-snug text-green-950">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs?.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className="whitespace-pre-line leading-8 text-gray-700"
                >
                  {paragraph}
                </p>
              ))}

              {section.list && section.list.length > 0 && (
                <ul className="list-disc space-y-2 pl-6 text-gray-700">
                  {section.list.map((item, itemIndex) => (
                    <li key={itemIndex} className="leading-7">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>

      <footer className="mt-12 border-t border-gray-200 pt-6">
        <Link
          href="/blog"
          className="font-semibold text-green-800 hover:underline"
        >
          ← Explore more articles
        </Link>
      </footer>
    </main>
  );
}
