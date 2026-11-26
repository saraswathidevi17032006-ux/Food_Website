import mongoose from 'mongoose';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Escapes special regular expression characters in user-supplied search strings
 * to prevent MongoDB regex syntax errors and ReDoS.
 */
export const escapeRegex = (value = '') =>
  String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Validates whether a string is a valid MongoDB ObjectId.
 */
export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Validates basic email format.
 */
export const isValidEmail = (email) => EMAIL_REGEX.test(String(email || '').trim());
