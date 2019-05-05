import escapeRegExp from 'lodash/escapeRegExp';
import idps from '../../../idps';

const arr = Object.values(idps).map((idp) => {
  return {
    name: idp.name,
    type: idp.type,
    protocol: idp.protocol,
    logo: idp.logo, // TODO: Optimize image contents, e.g. use svgo
  };
});

export async function getIdentityProviderTypes(ctx, { q }) {
  if (q) {
    const re = new RegExp(escapeRegExp(q), 'i');
    return arr.filter((idp) => re.test(idp.name) || re.test(idp.type));
  }

  return arr;
}
