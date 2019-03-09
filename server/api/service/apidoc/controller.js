import memoize from 'lodash/memoize';
import pkg from '../../../../package.json';

const getApiDoc = memoize(({ router }) => {
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
      .filter((e) => !!e.name)
      .reduce((accumulator, e) => {
        const path = {};
        e.methods.forEach((method) => {
          path[method.toLowerCase()] = {
            externalDocs: {
              url: `https://github.com/yeepio/yeep/blob/master/docs/methods/${e.name}.md`,
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
        });
        accumulator[e.path] = path;
        return accumulator;
      }, {}),
  };
});

async function handler(ctx) {
  const apiDoc = getApiDoc(ctx);
  const { response } = ctx;
  response.status = 200;
  response.type = 'application/vnd.oai.openapi+json;version=3.0';
  response.body = apiDoc;
}

export default handler;
