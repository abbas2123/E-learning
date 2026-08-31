import apiClient from "./apiClient";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  color?: string;
  coursesCount?: number;
}

export const categoryService = {
  async getCategories(): Promise<CategoryItem[]> {
    const res = await apiClient.get<{ success: boolean; data: CategoryItem[] }>("/api/categories");
    return res.data.data;
  },
};
