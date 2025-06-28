import { postsMeta } from "../posts-meta";

export async function GET() {
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI SEO Blog – Am I Visible on AI</title>
    <description>Tips, news, and strategies for getting found by AI in 2025</description>
    <link>https://amivisibleonai.vercel.app/blog</link>
    <atom:link href="https://amivisibleonai.vercel.app/blog/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>noreply@amivisibleonai.vercel.app (Am I Visible on AI)</managingEditor>
    <webMaster>noreply@amivisibleonai.vercel.app (Am I Visible on AI)</webMaster>
    <category>Technology</category>
    <category>SEO</category>
    <category>AI</category>
    ${postsMeta
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <description>${post.description}</description>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>AI SEO</category>
      <category>AI Visibility</category>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}