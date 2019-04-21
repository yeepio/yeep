import has from 'lodash/has';
import { IdentityProviderNotFound, InvalidRedirectURI } from '../../../constants/errors';
import idps from '../../../idps';
import isValidRedirectUri from '../../../utils/isValidRedirectUri';

export default async function constructOAuthConsentURL({ config }, { provider, redirectUri }) {
  // ensure IdP is enabled in yeep config
  if (!has(config, ['idps', provider])) {
    throw new IdentityProviderNotFound(`Identity provider "${provider}" not found`);
  }

  // ensure redirect URI is valid
  if (!isValidRedirectUri(redirectUri, config.allowedRedirectUris)) {
    throw new InvalidRedirectURI('Invalid redirect URI');
  }

  // retrieve identity provider
  const idp = idps[provider];

  // create state to pass to URL
  const state = Buffer.from(JSON.stringify({ redirectUri }), 'utf8').toString('base64');

  // format auth URL
  const url = idp.formatAuthUrl({
    state,
    redirectUri,
    clientId: config.idps[provider].clientId,
  });

  return url;
}
