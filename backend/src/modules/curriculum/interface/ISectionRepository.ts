export interface LessonResourceDto {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface LessonDto {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  videoSourceType?: "uploaded" | "youtube" | "vimeo" | "external" | "hls";
  quizId?: string;
  questionCount?: number;
  duration: number;
  order: number;
  isPreview: boolean;
  resources: LessonResourceDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionDto {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons?: LessonDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSectionParams {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateSectionParams {
  title?: string;
  description?: string;
  order?: number;
}

export interface ISectionRepository {
  createSection(params: CreateSectionParams): Promise<SectionDto>;
  updateSection(sectionId: string, params: UpdateSectionParams): Promise<SectionDto | null>;
  deleteSection(sectionId: string): Promise<boolean>;
  findById(sectionId: string): Promise<SectionDto | null>;
  findByCourseId(courseId: string): Promise<SectionDto[]>;
  reorderSections(courseId: string, orderedSectionIds: string[]): Promise<SectionDto[]>;
  getMaxOrder(courseId: string): Promise<number>;
}
