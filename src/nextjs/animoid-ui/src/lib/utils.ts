import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import fs from "fs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function pause(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
