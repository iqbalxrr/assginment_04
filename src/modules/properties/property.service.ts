import { Prisma, PropertyStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

const propertyInclude = {
  category: { select: { id: true, name: true } },
  landlord: { select: { id: true, name: true, email: true, phone: true } },
  _count: { select: { reviews: true } },
};

interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  bedrooms?: number;
  status?: PropertyStatus;
  search?: string;
  page: number;
  limit: number;
}

export const getProperties = async (filters: PropertyFilters) => {
  const { page, limit, ...rest } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {};

  if (rest.location) {
    where.location = { contains: rest.location, mode: "insensitive" };
  }
  if (rest.minPrice || rest.maxPrice) {
    where.price = {};
    if (rest.minPrice) where.price.gte = rest.minPrice;
    if (rest.maxPrice) where.price.lte = rest.maxPrice;
  }
  if (rest.categoryId) where.categoryId = rest.categoryId;
  if (rest.bedrooms) where.bedrooms = { gte: rest.bedrooms };
  if (rest.status) where.status = rest.status;
  if (rest.search) {
    where.OR = [
      { title: { contains: rest.search, mode: "insensitive" } },
      { description: { contains: rest.search, mode: "insensitive" } },
      { location: { contains: rest.search, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      ...propertyInclude,
      reviews: {
        include: {
          tenant: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  return property;
};

export const createProperty = async (
  landlordId: string,
  data: {
    title: string;
    description: string;
    location: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area?: number;
    amenities: string[];
    images: string[];
    categoryId: string;
  }
) => {
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return prisma.property.create({
    data: { ...data, landlordId },
    include: propertyInclude,
  });
};

export const updateProperty = async (
  id: string,
  landlordId: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
    images: string[];
    categoryId: string;
    status: PropertyStatus;
  }>
) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  if (property.landlordId !== landlordId) {
    throw new ApiError(403, "You can only update your own properties");
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  }

  return prisma.property.update({
    where: { id },
    data,
    include: propertyInclude,
  });
};

export const deleteProperty = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  if (property.landlordId !== landlordId) {
    throw new ApiError(403, "You can only delete your own properties");
  }

  await prisma.property.delete({ where: { id } });
};

export const getLandlordProperties = async (landlordId: string) => {
  return prisma.property.findMany({
    where: { landlordId },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getAllPropertiesAdmin = async () => {
  return prisma.property.findMany({
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
};
