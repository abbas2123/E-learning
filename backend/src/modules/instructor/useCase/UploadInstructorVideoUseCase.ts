import type { IStorageService, VideoUploadResult } from "../../../shared/interfaces/IStorageService";

export interface UploadInstructorVideoInput {
  buffer: Buffer;
  folder?: string;
}

export class UploadInstructorVideoUseCase {
  constructor(private readonly storageService: IStorageService) {}

  async execute(input: UploadInstructorVideoInput): Promise<VideoUploadResult> {
    const { buffer, folder = "totc_lessons_videos" } = input;

    if (!buffer || buffer.length === 0) {
      throw new Error("No video file provided.");
    }

    const result = await this.storageService.uploadVideo(buffer, folder);

    return {
      url: result.url,
      duration: result.duration || 0,
    };
  }
}
