import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorName(error: Error): string | null | undefined {
  const errorNameMatch = error.message.match(/: ([A-Za-z]+):/);
  return errorNameMatch ? errorNameMatch[1] : null;
}
