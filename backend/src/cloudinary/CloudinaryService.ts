import cloudinary from "../config/cloudinary";
import type { IStorageService } from "../shared/interfaces/IStorageService";

export class CloudinaryService implements IStorageService {
  async uploadImage(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary upload failed."));
            return;
          }
          resolve(result.secure_url);
        },
      );
      uploadStream.end(buffer);
    });
  }

  async uploadVideo(
    buffer: Buffer,
    folder: string,
  ): Promise<{ url: string; duration?: number }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "video",
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary video upload failed."));
            return;
          }
          resolve({
            url: result.secure_url,
            duration: result.duration ? Math.round(result.duration) : undefined,
          });
        },
      );
      uploadStream.end(buffer);
    });
  }
}
