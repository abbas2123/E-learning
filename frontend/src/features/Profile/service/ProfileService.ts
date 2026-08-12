import apiClient from "../../../services/apiClient";

interface UpdateProfileData {
  name?: string;
  phone?: string;
  location?: string;
  avatar?: File;
}
export interface ChangePasswordData {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;
}

export const updateProfile = async (data: UpdateProfileData) => {
  // Avatar upload
  if (data.avatar) {
    const formData = new FormData();

    if (data.name !== undefined) {
      formData.append("name", data.name);
    }

    if (data.phone !== undefined) {
      formData.append("phone", data.phone);
    }

    if (data.location !== undefined) {
      formData.append("location", data.location);
    }

    formData.append("avatar", data.avatar);

    const response = await apiClient.patch("/api/profile", formData);

    return response.data;
  }

  // Normal profile update
  const response = await apiClient.patch("/api/profile", data);

  return response.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const response = await apiClient.patch(
    "/api/profile/password",

    data,
  );

  return response.data;
};
