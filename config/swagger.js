/**
 * Swagger API Configuration
 * Defines the OpenAPI 3.0 specification for the Collaborative Writing & Publishing Workspace API.
 */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Collaborative Writing & Publishing Workspace API',
    version: '1.0.0',
    description: 'API documentation and interactive playground for testing REST API endpoints of the Collaborative Writing & Publishing Workspace backend.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Default Local API Base URL',
    },
    {
      url: 'http://localhost:5000/api',
      description: 'Explicit Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: <token_value> (without "Bearer " prefix)',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
          role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-05-28T04:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-05-28T04:05:00Z' },
        },
      },
      Workspace: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d2b' },
          name: { type: 'string', example: 'My Workspace' },
          description: { type: 'string', example: 'A workspace for collaboration' },
          owner: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
          members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
                role: { type: 'string', enum: ['owner', 'editor', 'viewer'], example: 'viewer' },
                _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d2c' },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d3c' },
          title: { type: 'string', example: 'Draft Document' },
          content: { type: 'string', example: 'Write your content here...' },
          workspaceId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d2b' },
          author: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
          collaborators: {
            type: 'array',
            items: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d4d' },
          },
          status: { type: 'string', enum: ['draft', 'published'], example: 'draft' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d4e' },
          documentId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d3c' },
          userId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
          comment: { type: 'string', example: 'This paragraph needs review.' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d5f' },
          workspaceId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d2b' },
          documentId: { type: 'string', nullable: true, example: '60c72b2f9b1d8b2a3c8e4d3c' },
          userId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
          action: {
            type: 'string',
            enum: [
              'document_created',
              'document_updated',
              'document_published',
              'document_unpublished',
              'document_deleted',
              'collaborator_added',
              'collaborator_removed',
              'workspace_created',
              'workspace_updated',
              'workspace_deleted',
            ],
            example: 'document_created',
          },
          details: { type: 'string', example: 'Document title: Draft Document' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Something went wrong' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Creates a new user account and returns a JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', format: 'email', example: 'janedoe@example.com' },
                  password: { type: 'string', format: 'password', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
                        name: { type: 'string', example: 'Jane Doe' },
                        email: { type: 'string', format: 'email', example: 'janedoe@example.com' },
                        role: { type: 'string', example: 'user' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error / User already exists',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in an existing user',
        description: 'Authenticates a user with email and password, and returns a JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'janedoe@example.com' },
                  password: { type: 'string', format: 'password', example: 'securePassword123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d1a' },
                        name: { type: 'string', example: 'Jane Doe' },
                        email: { type: 'string', format: 'email', example: 'janedoe@example.com' },
                        role: { type: 'string', example: 'user' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error (missing fields or invalid format)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        description: 'Verify the refresh token and return a new access token and a rotated refresh token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error (missing refresh token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Invalid or expired refresh token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        description: 'Revokes the user\'s refresh token.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'Logged out successfully' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        description: 'Retrieves profile details of the currently authenticated user.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized (missing or invalid token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Authentication'],
        summary: 'Delete current user account',
        description: 'Permanently deletes the currently authenticated user account and performs cascade deletion on all user-owned data (workspaces, documents, comments).',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User account and associated data deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'User account and all associated data deleted successfully' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized (missing or invalid token)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/workspaces': {
      post: {
        tags: ['Workspaces'],
        summary: 'Create a workspace',
        description: 'Creates a new collaborative workspace. The creator becomes the owner.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Marketing Workspace' },
                  description: { type: 'string', example: 'A workspace dedicated to the marketing team.' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Workspace created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Workspace' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error (missing name)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Workspaces'],
        summary: 'Get all workspaces',
        description: 'Retrieves all workspaces where the current user is an owner or a member.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Workspaces retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 2 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Workspace' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/workspaces/{id}': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get a workspace by ID',
        description: 'Retrieves a single workspace by its MongoDB ObjectId. User must be a member or owner.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Workspace retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Workspace' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a workspace member)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Workspaces'],
        summary: 'Update a workspace by ID',
        description: 'Updates a workspace\'s name or description. Only the owner can perform this action.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Updated Workspace Name' },
                  description: { type: 'string', example: 'Updated description details.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Workspace updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Workspace' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not the workspace owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Workspaces'],
        summary: 'Delete a workspace',
        description: 'Deletes a workspace. Only the workspace owner can delete it.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Workspace deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', example: {} },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not the workspace owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/workspaces/{id}/members': {
      post: {
        tags: ['Workspaces'],
        summary: 'Manage workspace members',
        description: 'Adds or removes a member to/from the workspace. Only the owner can manage members.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'action'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'collaborator@example.com' },
                  action: { type: 'string', enum: ['add', 'remove'], example: 'add' },
                  role: { type: 'string', enum: ['owner', 'editor', 'viewer'], default: 'viewer', example: 'editor' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Member list updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Workspace' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error / Invalid action or role / Member already in workspace / Cannot remove yourself',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not the workspace owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace or User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/workspaces/{id}/logs': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get workspace activity logs',
        description: 'Retrieves activity logs for the workspace. Accessible to all members (owner, editor, viewer).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Activity logs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 5 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ActivityLog' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a workspace member)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/workspaces/{id}/documents': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get all documents in a workspace',
        description: 'Retrieves all documents inside the workspace. Accessible to all workspace members.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Documents retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 3 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Document' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a workspace member)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/workspaces/{id}/leave': {
      post: {
        tags: ['Workspaces'],
        summary: 'Leave a workspace',
        description: 'Allows a collaborator (non-owner) to leave the workspace.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The workspace ID to leave',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Successfully left the workspace',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string', example: 'Successfully left the workspace' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Workspace owner cannot leave / Not a member of the workspace',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/documents': {
      post: {
        tags: ['Documents'],
        summary: 'Create a new document',
        description: 'Creates a new document inside a workspace. Only workspace owners and editors can create documents.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'workspaceId'],
                properties: {
                  title: { type: 'string', example: 'Product Spec Doc' },
                  workspaceId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d2b' },
                  content: { type: 'string', example: 'Document body goes here...' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Document created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error (missing title or workspace ID)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a member of the workspace or role is viewer)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Workspace not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/documents/{id}': {
      get: {
        tags: ['Documents'],
        summary: 'Get a document by ID',
        description: 'Retrieves a single document details. User must be a member of the containing workspace.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The document ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Document retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a workspace member)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Documents'],
        summary: 'Update a document by ID',
        description: 'Updates document title or content. User must be the author, or an editor/owner in the workspace.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The document ID',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Product Spec Doc' },
                  content: { type: 'string', example: 'Updated document body contents...' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Document updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error (title empty if provided)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not document author and not workspace editor/owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Documents'],
        summary: 'Delete a document',
        description: 'Deletes a document. Only the document author or the workspace owner can delete a document.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The document ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Document deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'object', example: {} },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not author and not workspace owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/documents/{id}/publish': {
      post: {
        tags: ['Documents'],
        summary: 'Publish or unpublish a document',
        description: 'Toggles a document status between "published" and "draft". Only workspace owners and editors can perform this action.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'The document ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Document published successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Document' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not workspace editor/owner)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/comments': {
      post: {
        tags: ['Comments'],
        summary: 'Add a comment to a document',
        description: 'Creates a new comment on a document. Accessible to any member of the containing workspace.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['documentId', 'comment'],
                properties: {
                  documentId: { type: 'string', example: '60c72b2f9b1d8b2a3c8e4d3c' },
                  comment: { type: 'string', example: 'Here is some constructive feedback!' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Comment created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error (missing documentId or comment text)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a member of the containing workspace)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/comments/{documentId}': {
      get: {
        tags: ['Comments'],
        summary: 'Get comments for a document',
        description: 'Retrieves all comments for a specific document. User must be a member of the containing workspace.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'documentId',
            in: 'path',
            required: true,
            description: 'The document ID to fetch comments for',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Comments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 3 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Comment' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Forbidden (not a member of the containing workspace)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
