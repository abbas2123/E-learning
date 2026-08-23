import type { IDiscussionRepository, PaginatedDiscussionsDto } from "../interface/IDiscussionRepository";

export class GetInstructorDiscussionsUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
    status?: string,
    courseId?: string,
    search?: string,
  ): Promise<PaginatedDiscussionsDto> {
    return this.discussionRepo.findInstructorDiscussions(
      instructorId,
      page,
      limit,
      status,
      courseId,
      search,
    );
  }
}
