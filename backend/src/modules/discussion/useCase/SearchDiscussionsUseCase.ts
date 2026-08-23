import type { IDiscussionRepository, PaginatedDiscussionsDto } from "../interface/IDiscussionRepository";

export class SearchDiscussionsUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    courseId: string,
    query: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDiscussionsDto> {
    if (!query || !query.trim()) {
      return this.discussionRepo.findCourseDiscussions(courseId, page, limit);
    }
    return this.discussionRepo.search(courseId, query.trim(), page, limit);
  }
}
