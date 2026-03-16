import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Compliance Student API',
    version: '1.0.0',
    description: 'API para verificação de compliance de estudantes',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['document', 'password'],
        properties: {
          document: { type: 'string', example: '12345678900' },
          password: { type: 'string', example: 'senha123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      CheckComplianceRequest: {
        type: 'object',
        required: ['name', 'document', 'password', 'birthDate', 'schoolId'],
        properties: {
          name: { type: 'string', example: 'João da Silva' },
          document: { type: 'string', example: '12345678900' },
          password: { type: 'string', example: 'senha123' },
          birthDate: { type: 'string', format: 'date', example: '1995-03-16' },
          schoolId: { type: 'string', example: 'school-uuid-aqui' },
        },
      },
      CheckComplianceResponse: {
        type: 'object',
        properties: {
          approved: { type: 'boolean', example: true },
          reason: { type: 'string', nullable: true, enum: ['A', 'B', 'C', null], example: null },
          student: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
              name: { type: 'string', example: 'João da Silva' },
              document: { type: 'string', example: '12345678900' },
              schoolId: { type: 'string', example: 'school-uuid-aqui' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar estudante',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/students/compliance': {
      post: {
        tags: ['Students'],
        summary: 'Verificar compliance do estudante',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckComplianceRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Resultado da verificação de compliance',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckComplianceResponse' },
              },
            },
          },
          '401': {
            description: 'Token não fornecido ou inválido',
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

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
