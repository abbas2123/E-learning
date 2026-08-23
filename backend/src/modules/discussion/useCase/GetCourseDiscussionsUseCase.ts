import type { IDiscussionRepository, PaginatedDiscussionsDto } from "../interface/IDiscussionRepository";

export class GetCourseDiscussionsUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    courseId: string,
    page: number,
    limit: number,
    status?: string,
    sort?: string,
  ): Promise<PaginatedDiscussionsDto> {
    return this.discussionRepo.findCourseDiscussions(courseId, page, limit, status, sort);
  }
}
