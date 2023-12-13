export const isValidString = (value: any, maxLength: number) => {
  return typeof value === 'string' && value.trim() && value.trim().length <= maxLength
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const
