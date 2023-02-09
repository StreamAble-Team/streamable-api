import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "./prisma/client";

export const signup = async (
  email: string,
  password: string,
  username: string,
  name?: string
) => {
  // check if password is hashed
  const isHashed = await bcrypt.compare(password, password);

  if (!isHashed) return "Password is not encrypted";

  // check if email is valid
  const emailRegex = /\S+@\S+\.\S+/;
  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) return "Email is not valid";

  // check if email is already in use
  const emailInUse = await prisma.user.findUnique({
    where: { email },
  });

  if (emailInUse) return "Email is already in use";

  // check if username is already in use
  const usernameInUse = await prisma.user.findUnique({
    where: { username },
  });

  if (usernameInUse) return "Username is already in use";

  // create user
  const user = await prisma.user.create({
    data: {
      email,
      password,
      username,
      name,
    },
  });

  return user;
};

export const login = async (email: string, password: string) => {
  // check if email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return "Email or password is incorrect";

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) return "Email or password is incorrect";

  // create jwt token
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign({ id: user.userId }, secret, {
    expiresIn: "60d",
  });

  // update user token
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      token,
    },
  });

  return updatedUser;
};

export const logout = async (id: number, token: string) => {
  const user = await prisma.user.findUnique({
    where: { userId: id },
  });

  if (!user) return "User not found";

  if (user.token !== token) return "Token is not valid";

  const updatedUser = await prisma.user.update({
    where: { userId: id },
    data: {
      token: null,
    },
  });

  if (!updatedUser) return "Error updating user";

  return updatedUser;
};

export const getUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { userId: id },
  });

  return user;
};

export const updateUser = async (
  id: number,
  email?: string,
  password?: string,
  username?: string,
  name?: string
) => {
  const user = await prisma.user.update({
    where: { userId: id },
    data: {
      email,
      password,
      username,
      name,
    },
  });

  return user;
};

export const deleteUser = async (id: number) => {
  const user = await prisma.user.delete({
    where: { userId: id },
  });

  return user;
};

export const resetPassword = async (email: string, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return "Email is not registered";

  const isHashed = await bcrypt.compare(newPassword, newPassword);

  if (!isHashed) return "Password is not encrypted";

  //check if password does not match old password
  const isPasswordCorrect = await bcrypt.compare(newPassword, user.password);

  if (isPasswordCorrect) return "Password is the same as old password";

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      password: newPassword,
    },
  });

  return updatedUser;
};
