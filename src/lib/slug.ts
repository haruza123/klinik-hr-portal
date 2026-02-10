/**
 * Generate SEO-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Remove special chars, keep unicode letters & numbers
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim hyphens from ends
    || 'untitled';
}
