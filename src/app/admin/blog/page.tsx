"use client";

import { useCallback, useEffect, useState } from "react";

type ContentType = "BLOG" | "VLOG";
type FilterType = "ALL" | "PUBLISHED" | "DRAFT" | "BLOG" | "VLOG";

type BlogSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string | null;
  sections: unknown;
  contentType: ContentType;
  videoUrl: string | null;
  published: boolean;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  contentType: ContentType;
  videoUrl: string;
  published: boolean;
  content: string;
};

const EMPTY_FORM: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  readTime: "5 min read",
  image: "",
  contentType: "BLOG",
  videoUrl: "",
  published: false,
  content: "",
};

function textToSections(text: string): BlogSection[] {
  const sections: BlogSection[] = [];
  let current: BlogSection = { paragraphs: [] };
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    const value = paragraphLines.join("\n").trim();

    if (value) {
      current.paragraphs = [...(current.paragraphs ?? []), value];
    }

    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length) {
      current.list = [...(current.list ?? []), ...listItems];
      listItems = [];
    }
  }

  function flushSection() {
    flushParagraph();
    flushList();

    if (
      current.heading ||
      (current.paragraphs?.length ?? 0) > 0 ||
      (current.list?.length ?? 0) > 0
    ) {
      sections.push(current);
    }

    current = { paragraphs: [] };
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      flushSection();
      current.heading = line.slice(2).trim();
    } else if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-*]\s+/, ""));
    } else if (!line) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraphLines.push(rawLine);
    }
  }

  flushSection();
  return sections;
}

function sectionsToText(value: unknown): string {
  if (!Array.isArray(value)) return "";

  const output: string[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const section = item as BlogSection;

    if (section.heading) {
      output.push(`# ${section.heading}`, "");
    }

    for (const paragraph of section.paragraphs ?? []) {
      output.push(paragraph, "");
    }

    for (const listItem of section.list ?? []) {
      output.push(`- ${listItem}`);
    }

    output.push("");
  }

  return output.join("\n").trim();
}

function toDateInput(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formFromPost(post: BlogPost): BlogForm {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    date: toDateInput(post.date),
    readTime: post.readTime || "",
    image: post.image ?? "",
    contentType: post.contentType,
    videoUrl: post.videoUrl ?? "",
    published: post.published,
    content: sectionsToText(post.sections),
  };
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const wordCount = form.content.trim()
    ? form.content.trim().split(/\s+/).length
    : 0;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/blog", {
        cache: "no-store",
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Could not load posts."));
      }

      if (
        !data ||
        typeof data !== "object" ||
        !("posts" in data) ||
        !Array.isArray(data.posts)
      ) {
        throw new Error("The server returned an unexpected posts response.");
      }

      setPosts(data.posts as BlogPost[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function change<K extends keyof BlogForm>(key: K, value: BlogForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
    setError("");
    setMessage("");
  }

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError("Please enter an article title.");
      return;
    }

    if (!form.excerpt.trim()) {
      setError("Please enter a short description.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please enter the article content.");
      return;
    }

    if (form.contentType === "VLOG" && !form.videoUrl.trim()) {
      setError("Please enter the Vlog video URL.");
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        sections: textToSections(form.content),
        contentType: form.contentType,
        readTime: form.readTime.trim() || "5 min read",
        image: form.image.trim(),
        videoUrl: form.videoUrl.trim(),
        published: form.published,
      };

      if (form.slug.trim()) payload.slug = form.slug.trim();
      if (form.date) payload.date = form.date;
      if (editingId) payload.id = editingId;

      const response = await fetch("/api/admin/blog", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Could not save post."));
      }

      setMessage(
        getErrorMessage(
          data,
          editingId
            ? "Post updated successfully."
            : "Post created successfully.",
        ),
      );

      resetForm();
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    const action = post.published ? "unpublish" : "publish";

    if (!window.confirm(`${action} "${post.title}"?`)) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          published: !post.published,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Could not update post."));
      }

      setMessage(
        getErrorMessage(data, "Publication status updated successfully."),
      );

      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update post.");
    }
  }

  async function deletePost(post: BlogPost) {
    if (
      !window.confirm(
        `Permanently delete "${post.title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/blog?id=${encodeURIComponent(post.id)}`,
        { method: "DELETE" },
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Could not delete post."));
      }

      if (editingId === post.id) resetForm();

      setMessage(getErrorMessage(data, "Post deleted successfully."));
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete post.");
    }
  }

  const filteredPosts = posts.filter((post) => {
    switch (filter) {
      case "PUBLISHED":
        return post.published;
      case "DRAFT":
        return !post.published;
      case "BLOG":
        return post.contentType === "BLOG";
      case "VLOG":
        return post.contentType === "VLOG";
      default:
        return true;
    }
  });

  const fieldClass =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100";

  const buttonClass =
    "rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-green-800">
            DEORA ADMIN
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Blog &amp; Vlogs
          </h1>
          <p className="mt-3 text-gray-600">
            Create articles, add cover images, manage posts and publish content.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900"
          >
            {message}
          </div>
        )}

        <section className="mb-10 rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Post" : "Create New Post"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fields marked with * are required.
              </p>
            </div>

            {editingId && (
              <button type="button" onClick={resetForm} className={buttonClass}>
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={savePost} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="font-semibold">
                Content Type
                <select
                  className={fieldClass}
                  value={form.contentType}
                  onChange={(event) =>
                    change("contentType", event.target.value as ContentType)
                  }
                >
                  <option value="BLOG">Blog Article</option>
                  <option value="VLOG">Vlog Video</option>
                </select>
              </label>

              <label className="font-semibold">
                Publication Status
                <select
                  className={fieldClass}
                  value={form.published ? "published" : "draft"}
                  onChange={(event) =>
                    change("published", event.target.value === "published")
                  }
                >
                  <option value="draft">Save as Draft</option>
                  <option value="published">Publish Now</option>
                </select>
              </label>
            </div>

            <label className="block font-semibold">
              Article Title *
              <input
                required
                maxLength={200}
                className={fieldClass}
                value={form.title}
                onChange={(event) => change("title", event.target.value)}
                placeholder="Enter the article title"
              />
            </label>

            <label className="block font-semibold">
              URL Slug (optional)
              <input
                className={fieldClass}
                value={form.slug}
                onChange={(event) => change("slug", event.target.value)}
                placeholder="Leave blank to generate automatically"
              />
            </label>

            <label className="block font-semibold">
              Short Description *
              <textarea
                required
                maxLength={1000}
                rows={3}
                className={fieldClass}
                value={form.excerpt}
                onChange={(event) => change("excerpt", event.target.value)}
                placeholder="A short summary displayed on the blog page"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="font-semibold">
                Publication Date
                <input
                  type="date"
                  className={fieldClass}
                  value={form.date}
                  onChange={(event) => change("date", event.target.value)}
                />
              </label>

              <label className="font-semibold">
                Reading Time
                <input
                  className={fieldClass}
                  value={form.readTime}
                  onChange={(event) => change("readTime", event.target.value)}
                  placeholder="10 min read"
                />
              </label>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
              <label htmlFor="cover-image-url" className="block font-semibold">
                Cover Image URL
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (optional)
                </span>
              </label>

              <p className="mt-1 text-sm text-gray-600">
                Paste an image URL or use an image already in the public folder,
                for example /images/blogs/blog-herbal-tea.png.
              </p>

              <input
                id="cover-image-url"
                type="text"
                className={fieldClass}
                value={form.image}
                onChange={(event) => change("image", event.target.value)}
                placeholder="/images/blogs/blog-herbal-tea.png"
              />

              {form.image.trim() && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold">Image Preview</p>
                  <div className="overflow-hidden rounded-xl border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image.trim()}
                      alt="Cover image preview"
                      className="max-h-72 w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      onLoad={(event) => {
                        event.currentTarget.style.display = "block";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {form.contentType === "VLOG" && (
              <label className="block font-semibold">
                Video URL *
                <input
                  required
                  type="url"
                  className={fieldClass}
                  value={form.videoUrl}
                  onChange={(event) => change("videoUrl", event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>
            )}

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="article-content" className="text-lg font-bold">
                  Article Content *
                </label>
                <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-900">
                  {wordCount.toLocaleString()} words
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Write or paste your article here. You can write long articles of
                10,000 words or more. Leave a blank line between paragraphs. No
                JSON is needed.
              </p>

              <textarea
                id="article-content"
                required
                spellCheck
                className={`${fieldClass} min-h-[500px] resize-y font-sans text-base leading-8`}
                value={form.content}
                onChange={(event) => change("content", event.target.value)}
                placeholder="Write your full article here..."
              />
            </div>

            <div className="flex flex-wrap gap-3 border-t pt-5">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Post"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-6 py-3 font-semibold hover:bg-gray-100"
              >
                Clear Form
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">All Posts</h2>
              <p className="mt-1 text-sm text-gray-500">
                {posts.length} total ·{" "}
                {posts.filter((post) => post.published).length} published ·{" "}
                {posts.filter((post) => !post.published).length} drafts
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadPosts()}
              disabled={loading}
              className={buttonClass}
            >
              Refresh Posts
            </button>
          </div>

          <label className="mb-6 block max-w-sm font-semibold">
            Filter Posts
            <select
              className={fieldClass}
              value={filter}
              onChange={(event) => setFilter(event.target.value as FilterType)}
            >
              <option value="ALL">All Posts</option>
              <option value="PUBLISHED">Published Posts</option>
              <option value="DRAFT">Drafts Only</option>
              <option value="BLOG">Blog Articles</option>
              <option value="VLOG">Vlogs</option>
            </select>
          </label>

          {loading ? (
            <p className="py-8 text-gray-600">Loading posts...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-5 text-gray-600">
              No posts found for this filter.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <article key={post.id} className="rounded-xl border p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {post.image ? (
                        <div className="h-24 w-28 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-xs text-gray-400">
                          No image
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-green-900">
                            {post.contentType === "VLOG" ? "VLOG" : "BLOG"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 ${
                              post.published
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </div>

                        <h3 className="break-words text-lg font-bold">
                          {post.title}
                        </h3>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          /blog/{post.slug}
                        </p>

                        <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                          {post.excerpt}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">
                          {post.readTime || "Reading time not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForm(formFromPost(post));
                          setEditingId(post.id);
                          setMessage("");
                          setError("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={buttonClass}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void togglePublish(post)}
                        className={`${buttonClass} border-green-700 text-green-800`}
                      >
                        {post.published ? "Unpublish" : "Publish"}
                      </button>

                      {post.published && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClass}
                        >
                          View
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => void deletePost(post)}
                        className={`${buttonClass} border-red-300 text-red-700 hover:bg-red-50`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
