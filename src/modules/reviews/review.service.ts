import { RentalStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

export const createReview = async (
  tenantId: string,
  data: { rentalRequestId: string; rating: number; comment?: string }
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: data.rentalRequestId },
    include: { review: true },
  });

  if (!rental) {
    throw new ApiError(404, "Rental request not found");
  }
  if (rental.tenantId !== tenantId) {
    throw new ApiError(403, "You can only review your own rentals");
  }
  if (rental.status !== RentalStatus.COMPLETED) {
    throw new ApiError(400, "You can only review completed rentals");
  }
  if (rental.review) {
    throw new ApiError(409, "You have already reviewed this rental");
  }

  return prisma.review.create({
    data: {
      rating: data.rating,
      comment: data.comment,
      tenantId,
      propertyId: rental.propertyId,
      rentalRequestId: data.rentalRequestId,
    },
    include: {
      tenant: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } },
    },
  });
};

export const getPropertyReviews = async (propertyId: string) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, averageRating: Math.round(avgRating * 10) / 10, total: reviews.length };
};
