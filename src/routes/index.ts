import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import categoryRoutes from "../modules/categories/category.routes";
import propertyRoutes, {
  landlordRouter as landlordPropertyRoutes,
} from "../modules/properties/property.routes";
import rentalRoutes, {
  landlordRouter as landlordRentalRoutes,
} from "../modules/rentals/rental.routes";
import reviewRoutes from "../modules/reviews/review.routes";
import adminRoutes from "../modules/admin/admin.routes";
import paymentRoutes from "../modules/payments/payment.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/properties", propertyRoutes);
router.use("/landlord/properties", landlordPropertyRoutes);
router.use("/landlord/requests", landlordRentalRoutes);
router.use("/rentals", rentalRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
