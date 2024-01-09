import { query } from 'express-validator'

export const sortDirectionQueryValidation = query('sortDirection')
  .if(
    query('sortDirection').not().isIn(['asc', 'desc'])
  )
  .customSanitizer(() => 'desc')
export const pageNumberQueryValidation = query('pageNumber')
  .toInt()
  .if(
    query('pageNumber').not().isInt({ gt: 0 })
  )
  .customSanitizer(() => 1)
export const pageSizeQueryValidation = query('pageSize')
  .toInt()
  .if(
    query('pageSize').not().isInt({ gt: 0 })
  )
  .customSanitizer(() => 10)

export const commonQueryValidation = () => [
  sortDirectionQueryValidation,
  pageNumberQueryValidation,
  pageSizeQueryValidation
]
