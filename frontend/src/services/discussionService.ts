import apiClient from "./apiClient";

export interface DiscussionAuthor {
  id: string;
  name: string;
  avatar: string | null;
  role: "student" | "instructor" | "admin";
}

export interface Discussion {
  id: string;
  courseId: string;
  courseTitle?: string;
  lessonId: string | null;
  lessonTitle: string | null;
  studentId: string;
  author: DiscussionAuthor;
  title: string;
  question: string;
  status: "open" | "answered" | "resolved" | "locked";
  isPinned: boolean;
  replyCount: number;
  lastReplyAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  authorRole: "student" | "instructor" | "admin";
  author: DiscussionAuthor;
  content: string;
  isInstructorReply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDiscussions {
  discussions: Discussion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DiscussionReport {
  id: string;
  discussionId: string;
  replyId: string | null;
  reportedBy: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed" | "action_taken";
  createdAt: string;
  updatedAt: string;
}

export const discussionService = {
  // Create discussion
  async createDiscussion(
    courseId: string,
    title: string,
    question: string,
    lessonId?: string | null,
  ): Promise<Discussion> {
    const res = await apiClient.post<{ success: boolean; data: Discussion }>(
      `/api/courses/${courseId}/discussions`,
      { title, question, lessonId },
    );
    return res.data.data;
  },

  // Get course discussions
  async getCourseDiscussions(
    courseId: string,
    page = 1,
    limit = 20,
    status?: string,
    sort?: string,
  ): Promise<PaginatedDiscussions> {
    const res = await apiClient.get<{ success: boolean; data: PaginatedDiscussions }>(
      `/api/courses/${courseId}/discussions`,
      { params: { page, limit, status, sort } },
    );
    return res.data.data;
  },

  // Get lesson discussions
  async getLessonDiscussions(
    courseId: string,
    lessonId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedDiscussions> {
    const res = await apiClient.get<{ success: boolean; data: PaginatedDiscussions }>(
      `/api/courses/${courseId}/lessons/${lessonId}/discussions`,
      { params: { page, limit } },
    );
    return res.data.data;
  },

  // Get single discussion + replies
  async getDiscussion(
    discussionId: string,
  ): Promise<{ discussion: Discussion; replies: DiscussionReply[] }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { discussion: Discussion; replies: DiscussionReply[] };
    }>(`/api/discussions/${discussionId}`);
    return res.data.data;
  },

  // Update discussion
  async updateDiscussion(
    discussionId: string,
    title?: string,
    question?: string,
  ): Promise<Discussion> {
    const res = await apiClient.put<{ success: boolean; data: Discussion }>(
      `/api/discussions/${discussionId}`,
      { title, question },
    );
    return res.data.data;
  },

  // Delete discussion
  async deleteDiscussion(discussionId: string): Promise<void> {
    await apiClient.delete(`/api/discussions/${discussionId}`);
  },

  // Add reply
  async createReply(discussionId: string, content: string): Promise<DiscussionReply> {
    const res = await apiClient.post<{ success: boolean; data: DiscussionReply }>(
      `/api/discussions/${discussionId}/replies`,
      { content },
    );
    return res.data.data;
  },

  // Update reply
  async updateReply(
    discussionId: string,
    replyId: string,
    content: string,
  ): Promise<DiscussionReply> {
    const res = await apiClient.put<{ success: boolean; data: DiscussionReply }>(
      `/api/discussions/${discussionId}/replies/${replyId}`,
      { content },
    );
    return res.data.data;
  },

  // Delete reply
  async deleteReply(discussionId: string, replyId: string): Promise<void> {
    await apiClient.delete(`/api/discussions/${discussionId}/replies/${replyId}`);
  },

  // Resolve discussion
  async resolveDiscussion(discussionId: string): Promise<Discussion> {
    const res = await apiClient.patch<{ success: boolean; data: Discussion }>(
      `/api/discussions/${discussionId}/resolve`,
    );
    return res.data.data;
  },

  // Pin discussion
  async pinDiscussion(discussionId: string): Promise<Discussion> {
    const res = await apiClient.patch<{ success: boolean; data: Discussion }>(
      `/api/discussions/${discussionId}/pin`,
    );
    return res.data.data;
  },

  // Search discussions
  async searchDiscussions(
    courseId: string,
    q: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedDiscussions> {
    const res = await apiClient.get<{ success: boolean; data: PaginatedDiscussions }>(
      `/api/discussions/search`,
      { params: { courseId, q, page, limit } },
    );
    return res.data.data;
  },

  // Report discussion
  async reportDiscussion(discussionId: string, reason: string): Promise<DiscussionReport> {
    const res = await apiClient.post<{ success: boolean; data: DiscussionReport }>(
      `/api/discussions/${discussionId}/report`,
      { reason },
    );
    return res.data.data;
  },

  // Report reply
  async reportReply(
    discussionId: string,
    replyId: string,
    reason: string,
  ): Promise<DiscussionReport> {
    const res = await apiClient.post<{ success: boolean; data: DiscussionReport }>(
      `/api/discussions/${discussionId}/replies/${replyId}/report`,
      { reason },
    );
    return res.data.data;
  },

  // Instructor discussions inbox
  async getInstructorDiscussions(
    page = 1,
    limit = 20,
    status?: string,
    courseId?: string,
    search?: string,
  ): Promise<PaginatedDiscussions> {
    const res = await apiClient.get<{ success: boolean; data: PaginatedDiscussions }>(
      `/api/instructor/discussions`,
      { params: { page, limit, status, courseId, search } },
    );
    return res.data.data;
  },

  // Admin moderation
  async getAllDiscussions(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedDiscussions> {
    const res = await apiClient.get<{ success: boolean; data: PaginatedDiscussions }>(
      `/api/admin/discussions`,
      { params: { page, limit, status } },
    );
    return res.data.data;
  },

  async getReports(
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<{ reports: DiscussionReport[]; total: number; totalPages: number }> {
    const res = await apiClient.get<{
      success: boolean;
      data: { reports: DiscussionReport[]; total: number; totalPages: number };
    }>(`/api/admin/discussions/reports`, { params: { page, limit, status } });
    return res.data.data;
  },

  async moderateDiscussion(
    action: string,
    discussionId?: string,
    replyId?: string,
    reportId?: string,
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/api/admin/discussions/moderate`,
      { action, discussionId, replyId, reportId },
    );
    return res.data;
  },
};

export default discussionService;
