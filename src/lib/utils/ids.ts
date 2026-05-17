import { ID } from 'appwrite';

export type EntityPrefix = 'USER' | 'TRN' | 'CMP' | 'JOB' | 'PRJ' | 'TKT' | 'DSP' | 'TXN' | 'APP' | 'MS' | 'ORG';

/**
 * Generates a Universal ID following the TRZ-PREFIX-XXXXXX pattern.
 * Based on the UNIVERSAL ID LAW in MASTER_SYSTEM_ARCHITECTURE.md.
 */
export const generateTrzId = (prefix: EntityPrefix): string => {
  // Generate a random 8-character alphanumeric string (collision-safe enough for our scale)
  // We use Appwrite's unique ID as a base if needed, or a simple random string.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters
  let randomPart = '';
  for (let i = 0; i < 10; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `TRZ-${prefix}-${randomPart}`;
};

/**
 * Wrapper for Appwrite unique ID if we want to use it alongside our public IDs
 */
export const generateInternalId = (): string => ID.unique();
