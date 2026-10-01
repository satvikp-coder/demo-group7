import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { env } from "../config/env.js";
import { createUser, findCredentialsByEmail, findById } from "../models/userModel.js";
import { HttpError } from "../middleware/errorHandler.js";

const BCRYPT_ROUNDS = 12;
const TOKEN_LIFETIME_SECONDS = 3600;
// Unknown emails still pay the password-comparison cost, without a hardcoded credential.
const dummyHash = bcrypt.hash(randomBytes(32).toString("hex"), BCRYPT_ROUNDS);

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(req, res) {
  const { name, email, password, role } = req.validated.body;
  if (role === "tour_operator" && !env.ALLOW_OPERATOR_REGISTRATION) throw new HttpError(403, "Operator accounts require administrator approval");
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser({ name, email, passwordHash, role });
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await findCredentialsByEmail(email);
  const supportedRole = user && ["tourist", "tour_operator"].includes(user.role);
  const matches = await bcrypt.compare(password, user?.password_hash ?? await dummyHash);
  if (!user || !supportedRole || !matches) {
    throw new HttpError(401, "Invalid email or password");
  }
  const token = jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    algorithm: "HS256",
    expiresIn: TOKEN_LIFETIME_SECONDS,
  });
  res.json({ token, tokenType: "Bearer", expiresIn: TOKEN_LIFETIME_SECONDS, user: publicUser(user) });
}

export async function me(req, res) {
  const user = await findById(req.user.id);
  if (!user) throw new HttpError(401, "Account no longer exists");
  res.json({ user: publicUser(user) });
}
