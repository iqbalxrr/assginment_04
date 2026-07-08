import { Prisma, RentalStatus, Role } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

const rentalInclude = {
  property: {
    select: {
      id: true,
      title: true,
      location: true,
      price: true,
      landlordId: true,
      landlord: { select: { id: true, name: true, email: true } },
    },
  },
  tenant: { select: { id: true, name: true, email: true, phone: true } },
  payments: true,
  review: true,
};

export const createRentalRequest = async (
  tenantId: string,
  data: { propertyId: string; startDate: string; endDate: string; message?: string }
) => {
  const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }
  if (property.status !== "AVAILABLE") {
    throw new ApiError(400, "Property is not available for rental");
  }
  if (property.landlordId === tenantId) {
    throw new ApiError(400, "You cannot request your own property");
  }

  const existing = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: data.propertyId,
      status: { in: [RentalStatus.PENDING, RentalStatus.APPROVED, RentalStatus.ACTIVE] },
    },
  });
  if (existing) {
    throw new ApiError(409, "You already have an active request for this property");
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: data.propertyId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      message: data.message,
    },
    include: rentalInclude,
  });
};

export const getUserRentals = async (
  userId: string,
  role: Role,
  filters: { status?: RentalStatus; page: number; limit: number }
) => {
  const { status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.RentalRequestWhereInput = {};

  if (role === Role.TENANT) {
    where.tenantId = userId;
  } else if (role === Role.LANDLORD) {
    where.property = { landlordId: userId };
  }

  if (status) where.status = status;

  const [rentals, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      include: rentalInclude,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  return {
    rentals,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getRentalById = async (id: string, userId: string, role: Role) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: rentalInclude,
  });

  if (!rental) {
    throw new ApiError(404, "Rental request not found");
  }

  const isTenant = rental.tenantId === userId;
  const isLandlord = rental.property.landlordId === userId;
  const isAdmin = role === Role.ADMIN;

  if (!isTenant && !isLandlord && !isAdmin) {
    throw new ApiError(403, "You do not have access to this rental request");
  }

  return rental;
};

export const updateRentalStatus = async (
  id: string,
  landlordId: string,
  status: RentalStatus
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!rental) {
    throw new ApiError(404, "Rental request not found");
  }
  if (rental.property.landlordId !== landlordId) {
    throw new ApiError(403, "You can only manage requests for your own properties");
  }
  if (rental.status !== RentalStatus.PENDING) {
    throw new ApiError(400, "Only pending requests can be approved or rejected");
  }

  const updated = await prisma.rentalRequest.update({
    where: { id },
    data: { status },
    include: rentalInclude,
  });

  if (status === RentalStatus.APPROVED) {
    await prisma.property.update({
      where: { id: rental.propertyId },
      data: { status: "UNAVAILABLE" },
    });
  }

  return updated;
};

export const getAllRentalsAdmin = async () => {
  return prisma.rentalRequest.findMany({
    include: rentalInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const completeRental = async (rentalId: string) => {
  const rental = await prisma.rentalRequest.findUnique({ where: { id: rentalId } });
  if (!rental) {
    throw new ApiError(404, "Rental request not found");
  }
  if (rental.status !== RentalStatus.ACTIVE) {
    throw new ApiError(400, "Only active rentals can be completed");
  }

  return prisma.$transaction([
    prisma.rentalRequest.update({
      where: { id: rentalId },
      data: { status: RentalStatus.COMPLETED },
    }),
    prisma.property.update({
      where: { id: rental.propertyId },
      data: { status: "AVAILABLE" },
    }),
  ]);
};
