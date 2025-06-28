import { notFound } from "next/navigation";
import { ModernHeader } from "@/components/modern-header";
import { postsMeta } from "../posts-meta";
import { Metadata } from "next";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return postsMeta.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = postsMeta.find((p) => p.slug === slug);
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image],
      url: post.url,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  
  // Verify the post exists in our metadata
  const post = postsMeta.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  let Post;
  try {
    // Try importing the MDX file
    const module = await import(`../${slug}.mdx`);
    Post = module.default;
  } catch (e) {
    console.error(`Failed to import blog post: ${slug}`, e);
    notFound();
  }

  return (
    <>
      <ModernHeader />
      <Post />
    </>
  );
} 