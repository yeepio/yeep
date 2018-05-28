import axios from 'axios';
import gravatar from 'gravatar';

function getGravatarUrl(email) {
  return axios
    .request({
      method: 'head',
      url: gravatar.url(email, { s: 400, d: 404 }, true),
    })
    .then(() => gravatar.url(email, { s: 400 }, true))
    .catch(() => null);
}

export { getGravatarUrl };
