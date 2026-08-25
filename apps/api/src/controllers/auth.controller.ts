import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";
import { hashToken, signAccessToken, signRefreshToken } from "../utils/tokens.js";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function signup(req: Request, res: Response) {
  const input = signupSchema.parse(req.body);
  const existingUser = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existingUser) throw new HttpError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash
    }
  });

  const tokens = await createSession(user.id, user.email, user.role);
  return res.status(201).json({ user: sanitizeUser(user), ...tokens });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const tokens = await createSession(user.id, user.email, user.role);
  return res.json({ user: sanitizeUser(user), ...tokens });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true }
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
}

async function createSession(userId: string, email: string, role: string) {
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  const stored = await prisma.refreshToken.create({
    data: { userId, tokenHash: "pending", expiresAt }
  });
  const refreshToken = signRefreshToken(userId, stored.id);
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { tokenHash: hashToken(refreshToken) }
  });

  return {
    accessToken: signAccessToken({ sub: userId, email, role }),
    refreshToken
  };
}

function sanitizeUser(user: { id: string; name: string; email: string; phone: string | null; role: string; avatarUrl: string | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl
  };
}
