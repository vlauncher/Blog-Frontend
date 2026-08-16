export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "READER" | "AUTHOR" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  age?: number | null;
  bio?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  profilePicture?: string | null;
  profilePictureId?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  children?: Category[];
  _count?: { posts: number };
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface TocItem {
  level: number;
  text: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  contentHtml?: string | null;
  coverImage?: string | null;
  coverImageId?: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  readingTimeMinutes: number;
  wordCount: number;
  viewCount: number;
  publishedAt?: string | null;
  scheduledPublishAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    profile?: {
      bio?: string | null;
      profilePicture?: string | null;
    } | null;
  };
  category?: Category | null;
  tags: Tag[];
  reactionCounts?: Record<string, number>;
  userReaction?: string | null;
  isBookmarked?: boolean;
  tableOfContents?: TocItem[];
  _count?: {
    comments: number;
    reactions: number;
    bookmarks: number;
    revisions?: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  parentId?: string | null;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: { profilePicture?: string | null } | null;
  };
  replies?: Comment[];
}

export interface PostRevision {
  id: string;
  version: number;
  title: string;
  content: string;
  excerpt?: string | null;
  createdAt: string;
  editor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface NotificationItem {
  id: string;
  type: "NEW_FOLLOWER" | "COMMENT" | "REACTION" | "POST_PUBLISHED" | "SYSTEM";
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: { profilePicture?: string | null } | null;
  };
}

export interface AuthorDashboardData {
  totalPosts: number;
  totalViews: number;
  totalFollowers: number;
  totalComments: number;
  totalReactions: number;
  topPosts: Post[];
}

export interface PostAnalyticsData {
  postId: string;
  title: string;
  totalViews: number;
  uniqueVisitors: number;
  avgReadPercent: number;
}
