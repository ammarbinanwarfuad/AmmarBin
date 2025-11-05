import Parser from "rss-parser";
import { calculateReadTime } from "./utils";

const rssParser = new Parser();

export interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  url: string;
  publishedDate: Date;
  readTime: number;
  tags: string[];
  source: "gucc" | "hashnode";
}

// Fetch from Hashnode GraphQL API
export async function fetchHashnodePosts(
  username: string
): Promise<BlogPost[]> {
  // Extract hostname from URL or use default
  const blogUrlEnv = process.env.HASHNODE_BLOG_URL || `${username}.hashnode.dev`;
  const blogUrl = blogUrlEnv.replace(/^https?:\/\//, '').replace(/\/$/, ''); // Remove protocol and trailing slash

  const query = `
    query {
      publication(host: "${blogUrl}") {
        posts(first: 50) {
          edges {
            node {
              id
              title
              slug
              brief
              coverImage {
                url
              }
              publishedAt
              readTimeInMinutes
              content {
                markdown
              }
              tags {
                name
              }
            }
          }
        }
      }
    }
  `;

  try {
    // ⚡ Performance: Add timeout to external API calls
    const API_TIMEOUT = 10000; // 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch("https://gql.hashnode.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      cache: "no-store", // Don't cache during sync to get fresh data
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hashnode API error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch Hashnode posts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error("Hashnode GraphQL errors:", data.errors);
      throw new Error(`Hashnode GraphQL error: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
    }

    const publication = data.data?.publication;
    if (!publication) {
      console.error("No publication found in Hashnode response. Blog URL:", blogUrl);
      console.error("Response data:", JSON.stringify(data, null, 2));
      return [];
    }

    const posts = publication.posts?.edges || [];
    
    console.log(`Fetched ${posts.length} posts from Hashnode blog: ${blogUrl}`);

    if (posts.length === 0) {
      console.warn(`No posts found for Hashnode blog: ${blogUrl}.`);
      console.warn(`Make sure HASHNODE_BLOG_URL is correct. Current value: "${blogUrlEnv}"`);
    }

    return posts.map((edge: {
      node: {
        title: string;
        slug: string;
        content?: { markdown?: string };
        brief?: string;
        coverImage?: { url?: string };
        publishedAt: string;
        readTimeInMinutes?: number;
        tags?: Array<{ name: string }>;
      };
    }) => ({
      title: edge.node.title,
      slug: edge.node.slug,
      content: edge.node.content?.markdown || "",
      excerpt: edge.node.brief || "",
      featuredImage: edge.node.coverImage?.url || "",
      author: "Ammar Bin Anwar Fuad",
      url: `https://${blogUrl}/${edge.node.slug}`,
      publishedDate: new Date(edge.node.publishedAt),
      readTime: edge.node.readTimeInMinutes || 5,
      tags: edge.node.tags?.map((tag) => tag.name) || [],
      source: "hashnode" as const,
    }));
  } catch (error) {
    console.error("Error fetching Hashnode posts:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

// Fetch from GUCC Blog (RSS or scraping)
export async function fetchGUCCPosts(): Promise<BlogPost[]> {
  const guccBlogUrl = process.env.GUCC_BLOG_URL || "https://gucc.green.edu.bd/blog";
  const RSS_TIMEOUT = 10000; // 10 seconds

  try {
    // Try RSS feed first
    const rssUrl = `${guccBlogUrl}/rss`;
    
    // ⚡ Performance: Add timeout to RSS parsing
    const feedPromise = rssParser.parseURL(rssUrl);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('RSS feed timeout')), RSS_TIMEOUT)
    );
    
    const feed = await Promise.race([feedPromise, timeoutPromise]);

    return feed.items
      .filter((item) => {
        // Filter by author "Ammar"
        const author = item.creator || item.author || "";
        return author.toLowerCase().includes("ammar");
      })
      .map((item) => ({
        title: item.title || "",
        slug: item.link?.split("/").pop() || "",
        content: item.content || item.contentSnippet || "",
        excerpt: item.contentSnippet || "",
        featuredImage: item.enclosure?.url || "",
        author: "Ammar Bin Anwar Fuad",
        url: item.link || "",
        publishedDate: new Date(item.pubDate || Date.now()),
        readTime: calculateReadTime(item.content || item.contentSnippet || ""),
        tags: item.categories || [],
        source: "gucc" as const,
      }));
  } catch (error) {
    console.error("Error fetching GUCC posts:", error);
    // If RSS fails, you can implement web scraping here with cheerio
    return [];
  }
}

