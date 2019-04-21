import { readFileSync } from 'fs';
import { format as formatUrl } from 'url';
import axios from 'axios';
import { OAUTH } from '../constants/identityProviderTypes';

/**
 * Formats and returns a Google authorization URL with the supplied properties.
 * @param {Object} props
 * @property {string} props.redirectUri
 * @property {string} props.state
 * @property {Array<string>} [props.scope]
 * @property {string} props.clientId
 * @returns {string}
 * @see {@link https://developers.google.com/identity/protocols/OAuth2WebServer#creatingclient}
 */
function formatAuthUrl({
  state,
  scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  redirectUri,
  clientId,
}) {
  return formatUrl({
    protocol: 'https:',
    hostname: 'accounts.google.com',
    pathname: 'o/oauth2/v2/auth',
    query: {
      state,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: false,
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
 * @see {@link https://developers.google.com/identity/protocols/OAuth2WebServer#handlingresponse}
 */
async function exchangeAuthCode({ code, redirectUri, clientId, clientSecret }) {
  return axios
    .request({
      method: 'post',
      uri: 'https://www.googleapis.com/oauth2/v4/token',
      data: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
    })
    .then((response) => response.data)
    .catch((err) => err.response);
}

export default {
  name: 'Google',
  type: OAUTH,
  logo: {
    mime: 'image/svg+xml',
    extension: 'svg',
    value: readFileSync(require.resolve('./google.svg'), { encoding: 'utf8' }),
  },
  formatAuthUrl,
  exchangeAuthCode,
};
