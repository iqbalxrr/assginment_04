import { Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

interface UserFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}

export const getAllUsers = async (filters: UserFilters) => {
  const { role, status, search, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { properties: true, rentalRequests: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role === Role.ADMIN) {
    throw new ApiError(400, "Cannot change admin account status");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });
};

export const getDashboardStats = async () => {
  const [totalUsers, totalProperties, totalRentals, pendingRentals] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.rentalRequest.count(),
    prisma.rentalRequest.count({ where: { status: "PENDING" } }),
  ]);

  return { totalUsers, totalProperties, totalRentals, pendingRentals };
};
