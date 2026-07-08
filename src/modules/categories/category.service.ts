import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

export const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  return category;
};

export const createCategory = async (data: { name: string; description?: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new ApiError(409, "Category already exists");
  }
  return prisma.category.create({ data });
};

export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string }
) => {
  await getCategoryById(id);
  return prisma.category.update({ where: { id }, data });
};

export const deleteCategory = async (id: string) => {
  await getCategoryById(id);
  const propertyCount = await prisma.property.count({ where: { categoryId: id } });
  if (propertyCount > 0) {
    throw new ApiError(400, "Cannot delete category with associated properties");
  }
  return prisma.category.delete({ where: { id } });
};
