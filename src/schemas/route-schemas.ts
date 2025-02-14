import { errorResponses, successResponse } from './swagger-schemas'

export const genericErrorSchema = errorResponses[500]
export const successResponseSchema = successResponse

export const authHeaderSchema = {
  type: 'object',
  properties: {
    Authorization: {
      type: 'string',
      description: 'Bearer token',
      example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
    }
  },
  required: ['Authorization']
}

