export const errorResponses = {
  400: {
    description: 'Bad Request',
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    }
  },
  401: {
    description: 'Unauthorized',
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    }
  },
  403: {
    description: 'Forbidden',
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    }
  },
  404: {
    description: 'Not Found',
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    }
  },
  500: {
    description: 'Internal Server Error',
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' }
    }
  }
}

export const successResponse = {
  description: 'Successful response',
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' }
  }
} 