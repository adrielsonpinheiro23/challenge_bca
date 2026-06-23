export const userListSchema = {
  type: 'object',
  required: ['page', 'per_page', 'total', 'total_pages', 'data', 'support'],
  additionalProperties: false,
  properties: {
    page: { type: 'number' },
    per_page: { type: 'number' },
    total: { type: 'number' },
    total_pages: { type: 'number' },
    data: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'email', 'first_name', 'last_name', 'avatar'],
        additionalProperties: false,
        properties: {
          id: { type: 'number' },
          email: { type: 'string', format: 'email' },
          first_name: { type: 'string', minLength: 1 },
          last_name: { type: 'string', minLength: 1 },
          avatar: { type: 'string', minLength: 1 },
        },
      },
    },
    support: {
      type: 'object',
      required: ['url', 'text'],
      additionalProperties: false,
      properties: {
        url: { type: 'string', minLength: 1 },
        text: { type: 'string', minLength: 1 },
      },
    },
    _meta: {
      type: 'object',
      additionalProperties: true,
    },
  },
} as const;
