import bcrypt from "bcryptjs";
import { config } from "../config.js";

export const hashPassword = (pwd: string) => bcrypt.hash(pwd, config.bcryptRounds);
export const verifyPassword = (pwd: string, hash: string) => bcrypt.compare(pwd, hash);
