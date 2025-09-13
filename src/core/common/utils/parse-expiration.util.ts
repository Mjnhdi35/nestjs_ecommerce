/**
 * Parse JWT expiration format to seconds
 * @param expiration - JWT expiration string (e.g., "7d", "15m", "1h", "30s")
 * @returns number of seconds
 */
export function parseExpirationToSeconds(expiration: string): number {
  // Parse JWT expiration format (e.g., "7d", "15m", "1h") to seconds
  const match = expiration.match(/^(\d+)([smhd])$/)
  if (!match) return 7 * 24 * 60 * 60 // Default to 7 days

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 60 * 60
    case 'd':
      return value * 24 * 60 * 60
    default:
      return 7 * 24 * 60 * 60
  }
}
