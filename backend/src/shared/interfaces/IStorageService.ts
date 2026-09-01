/**
 * Storage service port — abstracts Cloudinary (or any future storage provider)
 * from the application/Use Case layer.
 */
export interface VideoUploadResult {
  url: string;
  duration?: number;
}

export interface IStorageService {
  uploadImage(buffer: Buffer, folder: string): Promise<string>;
  uploadVideo(buffer: Buffer, folder: string): Promise<VideoUploadResult>;
}
