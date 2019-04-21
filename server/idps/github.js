import { readFileSync } from 'fs';
import { format as formatUrl } from 'url';
import axios from 'axios';
import { OAUTH } from '../constants/identityProviderTypes';

/**
 * Formats and returns an authorization URL with the supplied properties.
 * @param {Object} props
 * @property {string} props.redirectUri URL to redirect back to
 * @property {string} props.state unique string to be passed back upon completion
 * @property {Array<string>} [props.scope] list of oauth tokens
 * @property {string} props.clientId client id
 * @returns {string}
 * @see {@link https://developer.github.com/v3/oauth/#web-application-flow}
 */
function formatAuthUrl({ state, scope = ['read:user', 'user:email'], redirectUri, clientId }) {
  return formatUrl({
    protocol: 'https:',
    hostname: 'github.com',
    pathname: '/login/oauth/authorize',
    query: {
      state,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope.join(' '),
      allow_signup: false,
    },
  });
}

/**
 * Exchanges the given authorization code with access and refresh tokens.
 * @param {Object} props
 * @property {string} props.code temporary authorization code
 * @property {string} props.redirectUri URL to redirect back to; must match the originally submitted redirect URI
 * @property {string} props.clientId client id
 * @property {string} props.clientSecret client secret
 * @returns {Promise<Object>}
 * @see {@link https://developer.github.com/v3/oauth/#web-application-flow}
 */
async function exchangeAuthCode({ state, code, redirectUri, clientId, clientSecret }) {
  return axios
    .request({
      method: 'post',
      uri: 'https://github.com/login/oauth/access_token',
      data: {
        code,
        state,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      },
    })
    .then((response) => response.data)
    .catch((err) => err.response);
}

export default {
  name: 'GitHub',
  type: OAUTH,
  logo: {
    mime: 'image/svg+xml',
    extension: 'svg',
    value: readFileSync(require.resolve('./github.svg'), { encoding: 'utf8' }),
  },
  formatAuthUrl,
  exchangeAuthCode,
};
