import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/require-admin";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type BlogContentType = "BLOG" | "VLOG";

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSections(value: unknown): value is Prisma.InputJsonValue {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((section) => {
    if (!isObject(section)) {
      return false;
    }

    if (section.heading !== undefined && typeof section.heading !== "string") {
      return false;
    }

    if (section.paragraphs !== undefined) {
      if (
        !Array.isArray(section.paragraphs) ||
        !section.paragraphs.every((paragraph) => typeof paragraph === "string")
      ) {
        return false;
      }
    }

    if (section.list !== undefined) {
      if (
        !Array.isArray(section.list) ||
        !section.list.every((item) => typeof item === "string")
      ) {
        return false;
      }
    }

    return (
      section.heading !== undefined ||
      section.paragraphs !== undefined ||
      section.list !== undefined ||
      Object.keys(section).length === 0
    );
  });
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
    .replace(/-+$/g, "");
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    return false;
  }

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value.slice(0, 10)
  );
}

function isValidOptionalUrl(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  try {
    const url = new URL(trimmed);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function validateContentType(
  contentType: unknown,
  videoUrl: unknown,
): string | null {
  if (contentType !== "BLOG" && contentType !== "VLOG") {
    return "contentType must be BLOG or VLOG";
  }

  if (contentType === "VLOG") {
    if (typeof videoUrl !== "string" || !videoUrl.trim()) {
      return "A video URL is required for VLOG posts";
    }

    if (!isValidOptionalUrl(videoUrl)) {
      return "Video URL must be a valid HTTP or HTTPS URL";
    }
  }

  return null;
}

function isValidImage(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value !== "string" || value.length > 2048) {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  // Allow local public assets such as /images/blogs/example.png.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  return isValidOptionalUrl(trimmed) && /^https?:\/\//i.test(trimmed);
}

function isValidReadTime(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 50
  );
}

// GET /api/admin/blog
// Admin එකට published posts සහ drafts සියල්ල ලබා දෙයි.
export async function GET() {
  try {
    const auth = await requireAdmin();
    const authError = authErrorResponse(auth);

    if (authError) return authError;

    const posts = await prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/admin/blog:", error);

    return jsonError("Failed to load blog posts", 500);
  }
}

// POST /api/admin/blog
// අලුත් blog post එකක් හෝ vlog එකක් සාදයි.
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    const authError = authErrorResponse(auth);

    if (authError) return authError;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Request body must contain valid JSON", 400);
    }

    if (!isObject(body)) {
      return jsonError("Invalid request body", 400);
    }

    const { title, excerpt, sections } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200
    ) {
      return jsonError("Title is required (maximum 200 characters)", 400);
    }

    if (
      typeof excerpt !== "string" ||
      !excerpt.trim() ||
      excerpt.trim().length > 1000
    ) {
      return jsonError("Excerpt is required (maximum 1000 characters)", 400);
    }

    if (!isSections(sections)) {
      return jsonError(
        "Sections must contain valid heading, paragraphs, or list data",
        400,
      );
    }

    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? slugify(body.slug)
        : slugify(title);

    if (!slug) {
      return jsonError("A valid slug is required", 400);
    }

    if (slug.length > 180) {
      return jsonError("Slug is too long", 400);
    }

    const contentType: BlogContentType =
      body.contentType === undefined
        ? "BLOG"
        : (body.contentType as BlogContentType);

    if (contentType !== "BLOG" && contentType !== "VLOG") {
      return jsonError("contentType must be BLOG or VLOG", 400);
    }

    if (!isValidOptionalUrl(body.videoUrl)) {
      return jsonError("Video URL must be a valid HTTP or HTTPS URL", 400);
    }

    const videoUrl =
      typeof body.videoUrl === "string" && body.videoUrl.trim()
        ? body.videoUrl.trim()
        : null;

    const contentError = validateContentType(contentType, videoUrl);

    if (contentError) {
      return jsonError(contentError, 400);
    }

    if (body.readTime !== undefined && !isValidReadTime(body.readTime)) {
      return jsonError("Invalid readTime", 400);
    }

    if (
      body.date !== undefined &&
      (typeof body.date !== "string" || !isValidDate(body.date))
    ) {
      return jsonError("Invalid date", 400);
    }

    if (!isValidImage(body.image)) {
      return jsonError("Invalid image value", 400);
    }

    if (body.published !== undefined && typeof body.published !== "boolean") {
      return jsonError("published must be true or false", 400);
    }

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        sections,
        contentType,
        readTime:
          typeof body.readTime === "string"
            ? body.readTime.trim()
            : "2 min read",
        date: typeof body.date === "string" ? new Date(body.date) : new Date(),
        image:
          typeof body.image === "string" ? body.image.trim() || null : null,
        videoUrl,
        published: body.published === true,
      },
    });

    return NextResponse.json(
      {
        message: "Blog post created successfully",
        post,
      },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueError(error)) {
      return jsonError("That slug is already in use", 409);
    }

    console.error("POST /api/admin/blog:", error);

    return jsonError("Failed to create blog post", 500);
  }
}

// PATCH /api/admin/blog
// Body එකේ id එක ලබා දී post එක update කරයි.
export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();
    const authError = authErrorResponse(auth);

    if (authError) return authError;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Request body must contain valid JSON", 400);
    }

    if (!isObject(body) || typeof body.id !== "string" || !body.id.trim()) {
      return jsonError("A valid post id is required", 400);
    }

    const existing = await prisma.blogPost.findUnique({
      where: { id: body.id },
    });

    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    const data: Prisma.BlogPostUpdateInput = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 200
      ) {
        return jsonError("Invalid title", 400);
      }

      data.title = body.title.trim();

      if (body.slug === undefined) {
        const generatedSlug = slugify(body.title);

        if (!generatedSlug) {
          return jsonError("A valid slug is required", 400);
        }

        data.slug = generatedSlug;
      }
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !slugify(body.slug)) {
        return jsonError("Invalid slug", 400);
      }

      data.slug = slugify(body.slug);
    }

    if (body.excerpt !== undefined) {
      if (
        typeof body.excerpt !== "string" ||
        !body.excerpt.trim() ||
        body.excerpt.trim().length > 1000
      ) {
        return jsonError("Invalid excerpt", 400);
      }

      data.excerpt = body.excerpt.trim();
    }

    if (body.sections !== undefined) {
      if (!isSections(body.sections)) {
        return jsonError(
          "Sections must contain valid heading, paragraphs, or list data",
          400,
        );
      }

      data.sections = body.sections;
    }

    if (body.contentType !== undefined) {
      if (body.contentType !== "BLOG" && body.contentType !== "VLOG") {
        return jsonError("contentType must be BLOG or VLOG", 400);
      }

      data.contentType = body.contentType;
    }

    if (body.readTime !== undefined) {
      if (!isValidReadTime(body.readTime)) {
        return jsonError("Invalid readTime", 400);
      }

      data.readTime = body.readTime.trim();
    }

    if (body.date !== undefined) {
      if (typeof body.date !== "string" || !isValidDate(body.date)) {
        return jsonError("Invalid date", 400);
      }

      data.date = new Date(body.date);
    }

    if (body.image !== undefined) {
      if (!isValidImage(body.image)) {
        return jsonError("Invalid image value", 400);
      }

      data.image =
        typeof body.image === "string" ? body.image.trim() || null : null;
    }

    if (body.videoUrl !== undefined) {
      if (!isValidOptionalUrl(body.videoUrl)) {
        return jsonError("Invalid video URL", 400);
      }

      data.videoUrl =
        typeof body.videoUrl === "string" ? body.videoUrl.trim() || null : null;
    }

    const finalContentType =
      (data.contentType as BlogContentType | undefined) ?? existing.contentType;

    const finalVideoUrl =
      data.videoUrl === undefined ? existing.videoUrl : data.videoUrl;

    const contentError = validateContentType(finalContentType, finalVideoUrl);

    if (contentError) {
      return jsonError(contentError, 400);
    }

    if (body.published !== undefined) {
      if (typeof body.published !== "boolean") {
        return jsonError("published must be true or false", 400);
      }

      data.published = body.published;
    }

    const post = await prisma.blogPost.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json({
      message: "Blog post updated successfully",
      post,
    });
  } catch (error) {
    if (isUniqueError(error)) {
      return jsonError("That slug is already in use", 409);
    }

    console.error("PATCH /api/admin/blog:", error);

    return jsonError("Failed to update blog post", 500);
  }
}

// DELETE /api/admin/blog?id=POST_ID
export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    const authError = authErrorResponse(auth);

    if (authError) return authError;

    const id = new URL(request.url).searchParams.get("id");

    if (!id || !id.trim()) {
      return jsonError("Post id is required", 400);
    }

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/blog:", error);

    return jsonError("Failed to delete blog post", 500);
  }
}
