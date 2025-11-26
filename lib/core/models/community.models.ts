export interface BlogPost {
  Id: string;
  Title: string;
  AuthorName?: string;
  AuthorFullName?: string;
  AuthorId: string;
  MembershipName?: string;
  Content?: string;
  AuthorImageUrl?: string;
  CategoryName?: string;
  CategoryId?: string;
  LikesCount: number;
  ViewsCount: number;
  RepliesCount: number;
  CreatedAt: string;
  CoverMediaUrl?: string;
  UserReaction?: any;
  Excerpt?: string;
  Slug?: string;
  MetaKeywords?: string;
  MetaDescription?: string;
  MetaTitle?: string;
}

export interface Comment {
  Id: string;
  PostId: string;
  ParentReplyId: string;
  AuthorId: string;
  AuthorName?: string;
  AuthorFullName?: string;
  AuthorMembershipName?: string;
  AuthorImageUrl: string;
  Content: string;
  CreatedAt: string;
  LikesCount: number;
  UserReaction?: any;
}

export interface CommunityPost {
  Id: number;
  Name: string;
  Slug: string;
  IconUrl: string;
  PostsCount: number;
  TotalRepliesCount: number;
  LatestPost: {
    Id: number;
    Title: string;
    AuthorName?: string;
    AuthorFullName?: string;
    AuthorId: string;
    RepliesCount: number;
    LikesCount: number;
    ViewsCount: number;
    CommentsCount: number;
    CreatedAt: string;
  } | null;
}

export interface ProfileStats {
  comments: number;
  views: number;
  likes: number;
  followers: number;
}

