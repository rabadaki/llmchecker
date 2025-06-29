import { notFound } from "next/navigation";
import { ModernHeader } from "@/components/modern-header";
import { postsMeta } from "../posts-meta";
import { Metadata } from "next";

// Import all MDX files statically
import WhyAiVisibilityMatters2025 from "../why-ai-visibility-matters-2025.mdx";
import AiContentMyths2025 from "../ai-content-myths-2025.mdx";

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

const postComponents: Record<string, React.ComponentType> = {
  "why-ai-visibility-matters-2025": WhyAiVisibilityMatters2025,
  "ai-content-myths-2025": AiContentMyths2025,
};

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  
  // Verify the post exists in our metadata
  const post = postsMeta.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  // Get the component for this slug
  const Post = postComponents[slug];
  if (!Post) {
    console.error(`No component found for slug: ${slug}`);
    notFound();
  }

  return (
    <>
      <ModernHeader />
      <Post />
    </>
  );
} 