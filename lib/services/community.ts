import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const communityService = {
  async getPosts(payload: any) {
    const url = `${environment.communityApiUrl}/Posts/search`;
    return apiClient.post(url, payload);
  },

  async getPostById(postId: string) {
    const url = `${environment.communityApiUrl}/Posts/by-id`;
    return apiClient.post(url, { Id: postId });
  },

  async createPost(postData: any) {
    const url = `${environment.communityApiUrl}/Posts`;
    return apiClient.post(url, postData);
  },

  async updatePost(postData: any) {
    const url = `${environment.communityApiUrl}/Posts`;
    return apiClient.put(url, postData);
  },

  async deletePost(postId: string) {
    const url = `${environment.communityApiUrl}/Posts/${postId}`;
    return apiClient.delete(url);
  },

  async getBlogs(payload: any) {
    const url = `${environment.communityApiUrl}/Blogs/search`;
    return apiClient.post(url, payload);
  },

  async getBlogById(blogId: string) {
    const url = `${environment.communityApiUrl}/Blogs/by-id`;
    return apiClient.post(url, { Id: blogId });
  },

  async getCategoriesWithLatestPosts(type: string | number) {
    const url = `${environment.communityApiUrl}/CommunityPosts/categories-with-latest-posts?postType=${type}`;
    return apiClient.get(url, { skipAuth: true });
  },

  async getCategoryInfo(categoryId: string, type: number) {
    const url = `${environment.communityApiUrl}/CommunityCategories/get-by-id`;
    const body = {
      Id: categoryId,
      CategoryType: type,
    };
    return apiClient.post(url, body);
  },

  async getCategories(type: number) {
    const url = `${environment.communityApiUrl}/CommunityCategories/all`;
    const body = { CategoryType: type };
    return apiClient.post(url, body);
  },

  async getPostsByCategory(categoryId: string, page: number, pageSize: number, type: number) {
    const body = {
      CategoryId: categoryId,
      Page: page,
      PageSize: pageSize,
      PostType: type,
    };
    const url = `${environment.communityApiUrl}/CommunityPosts/category-posts`;
    return apiClient.post(url, body, { skipAuth: true });
  },

  async getCategoriesPostsInSidebar(categoryId: string, type: number) {
    const body = {
      CategoryId: categoryId,
      Count: 5,
      PostType: type,
    };
    const url = `${environment.communityApiUrl}/CommunityPosts/sidebar-posts`;
    return apiClient.post(url, body, { skipAuth: true });
  },

  async getPostDetails(postId: string, type: number) {
    const url = `${environment.communityApiUrl}/CommunityPosts/post-details`;
    return apiClient.post(url, { PostId: postId, PostType: type }, { skipAuth: true });
  },

  async getComments(postId: string) {
    const url = `${environment.communityApiUrl}/CommunityReplies/post/${postId}`;
    return apiClient.get(url, { skipAuth: true });
  },

  async addComment(postId: string, comment: string) {
    const url = `${environment.communityApiUrl}/CommunityReplies`;
    return apiClient.post(url, {
      Reply: {
        PostId: postId,
        ParentReplyId: null,
        Content: comment,
      },
    });
  },

  async likePost(postId: string, type: number) {
    const url = `${environment.communityApiUrl}/CommunityPosts/react-post`;
    return apiClient.post(url, {
      PostId: postId,
      Type: type,
    });
  },

  async likeComment(commentId: string, type: number) {
    const url = `${environment.communityApiUrl}/CommunityReplies/react-reply`;
    return apiClient.post(url, {
      ReplyId: commentId,
      Type: type,
    });
  },

  async sharePost(postId: string) {
    const url = `${environment.communityApiUrl}/CommunityPosts/${postId}/share`;
    return apiClient.post(url, {});
  },

  async viewPost(postId: string) {
    const url = `${environment.communityApiUrl}/CommunityPosts/${postId}/view`;
    return apiClient.post(url, {}, { skipAuth: true });
  },

  async getPostsByUserId(authorId: string) {
    const url = `${environment.communityApiUrl}/CommunityPosts/user-posts`;
    const body = {
      AuthorId: authorId,
      PostType: 0,
    };
    return apiClient.post(url, body);
  },

  async getPostsByUserId2(userId: string) {
    const url = `${environment.communityApiUrl}/CommunityPosts/user-posts`;
    return apiClient.post(url, { AuthorId: userId, PostType: 0 }, { skipAuth: true });
  },

  async getPopularPosts(type: number = 0) {
    const url = `${environment.communityApiUrl}/CommunityPosts/popular-posts`;
    const body = {
      Count: 5,
      PostType: type,
    };
    return apiClient.post(url, body, { skipAuth: true });
  },

  async uploadUserPost(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environment.communityApiUrl}/MediaFiles/upload`;
    return apiClient.post(url, formData);
  },

  async addPost(title: string, content: string, categoryId: string, coverMediaId: string | null) {
    const url = `${environment.communityApiUrl}/CommunityPosts`;
    const post = {
      Title: title,
      Content: content,
      CategoryId: categoryId,
      CoverMediaId: coverMediaId,
      PostType: 0,
    };
    return apiClient.post(url, { Post: post });
  },

  async updateCommunityPost(postId: string, title: string, content: string, categoryId: string, coverMediaId: string | null) {
    const url = `${environment.communityApiUrl}/CommunityPosts`;
    const post = {
      Id: postId,
      Title: title,
      Content: content,
      CategoryId: categoryId,
      CoverMediaId: coverMediaId,
      PostType: 0,
    };
    return apiClient.put(url, { Post: post });
  },
};

