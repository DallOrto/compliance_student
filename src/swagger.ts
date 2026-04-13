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
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
    schemas: {
      CheckComplianceRequest: {
        type: 'object',
        required: ['name', 'document', 'birthDate', 'schoolId', 'callbackUrl'],
        properties: {
          name: { type: 'string', example: 'João da Silva' },
          document: { type: 'string', example: '12345678900' },
          birthDate: { type: 'string', format: 'date', example: '1995-03-16' },
          schoolId: { type: 'string', example: 'school-uuid-aqui' },
          callbackUrl: { type: 'string', format: 'uri', example: 'http://api1/internal/compliance-result/attempt-id' },
        },
      },
      CheckComplianceResponse: {
        type: 'object',
        description: 'Solicitação aceita — processamento iniciado. O resultado será enviado via webhook para a callbackUrl.',
        properties: {
          jobId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
          status: { type: 'string', enum: ['PROCESSING'], example: 'PROCESSING' },
        },
      },
      ComplianceCallbackPayload: {
        type: 'object',
        description: 'Payload enviado via webhook para a callbackUrl quando o job é processado.',
        required: ['jobId', 'complianceId', 'approved', 'complianceStudentId'],
        properties: {
          jobId: { type: 'string', format: 'uuid' },
          complianceId: { type: 'string', format: 'uuid' },
          approved: { type: 'boolean' },
          reason: { type: 'string', nullable: true },
          complianceStudentId: { type: 'string', format: 'uuid' },
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
    '/students/compliance': {
      post: {
        tags: ['Students'],
        summary: 'Solicitar verificação de compliance (assíncrono)',
        description: 'Registra uma solicitação de compliance e retorna imediatamente com `jobId` e status `PROCESSING`. O resultado é processado em background após 30 minutos e enviado via **webhook** para a `callbackUrl` informada no body.',
        security: [{ apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckComplianceRequest' },
            },
          },
        },
        responses: {
          '202': {
            description: 'Solicitação aceita — resultado chegará via webhook',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckComplianceResponse' },
              },
            },
          },
          '401': {
            description: 'x-api-key ausente ou inválida',
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
