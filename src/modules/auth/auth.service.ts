import bcrypt from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { generateToken } from "../../middleware/auth";

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

const sanitizeUser = (user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      phone: input.phone,
      role: input.role,
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user: sanitizeUser(user), token };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status === UserStatus.BANNED) {
    throw new ApiError(403, "Your account has been banned");
  }

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return { user: sanitizeUser(user), token };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sanitizeUser(user);
};
