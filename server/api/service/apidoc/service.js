import path from 'path';
import memoize from 'lodash/memoize';
import has from 'lodash/has';
import globby from 'globby';
import joiToSwagger from 'joi-to-swagger';
import pkg from '../../../../package.json';

export const getOpenApiDocs = memoize(async ({ router }) => {
  // retrieve controllers file path
  const paths = await globby(['server/api/**/controller.js'], {
    expandDirectories: false,
  });

  // resolve controllers
  const controllers = paths
    .filter((e) => __filename.endsWith(e)) // exclude this controller
    .map((e) => require(path.relative(__dirname, e))); // sync is OK since constrollers are already resolved by now

  // create open api document
  return {
    openapi: '3.0.0',
    info: {
      title: pkg.name,
      description: pkg.description,
      license: {
        name: 'Apache 2.0',
      },
      version: pkg.version,
    },
    externalDocs: {
      url: 'https://github.com/yeepio/yeep/blob/master/docs/index.md',
    },
    paths: router.stack
      .filter((layer) => !!layer.name)
      .reduce((accumulator, layer) => {
        const pathObj = {};
        layer.methods.forEach((method) => {
          const operationObj = {
            operationId: layer.name,
            externalDocs: {
              url: `https://github.com/yeepio/yeep/blob/master/docs/methods/${layer.name}.md`,
            },
            responses: {
              200: {
                description: 'JSON RPC',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        ok: {
                          type: 'boolean',
                        },
                        error: {
                          type: 'object',
                          properties: {
                            code: {
                              type: 'integer',
                              format: 'int32',
                            },
                            message: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          };

          if (layer.stack.length === 1) {
            const controller = controllers.find((e) => e.default === layer.stack[0]);
            if (has(controller, ['validationSchema'])) {
              operationObj.requestBody = {
                content: {
                  'application/json': {
                    schema: joiToSwagger(controller.validationSchema).swagger,
                  },
                },
              };
            }
          }

          pathObj[method.toLowerCase()] = operationObj;
        });

        accumulator[layer.path] = pathObj;
        return accumulator;
      }, {}),
  };
});
