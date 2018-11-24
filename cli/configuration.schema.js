export default {
  $schema: 'http://json-schema.org/schema#',
  title: 'Configuration',
  type: 'object',
  required: ['baseUrl', 'jwt', 'mongo', 'storage'],
  properties: {
    baseUrl: {
      type: 'string',
      description: 'Server base url',
    },
    jwt: {
      type: 'object',
      required: ['type', 'secret'],
      properties: {
        type: {
          type: 'string',
        },
        secret: {
          type: 'string',
        },
      },
      description: 'JWT configuration object',
    },
    mongo: {
      type: 'object',
      required: ['uri', 'migrationDir'],
      properties: {
        uri: {
          type: 'string',
          format: 'uri',
        },
        migrationDir: {
          type: 'string',
        },
      },
      description: 'Mongo configuration object',
    },
    port: {
      type: 'number',
      minimum: 0,
      maximum: 65535,
    },
    storage: {
      type: 'object',
      required: ['type', 'uploadDir'],
      properties: {
        type: {
          type: 'string',
        },
        uploadDir: {
          type: 'string',
        },
      },
      description: 'Storage configuration object',
    },
  },
};
