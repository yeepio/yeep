import find from 'lodash/find';

export default function getUserPrimaryEmail(emails) {
  const primaryEmail = find(emails, (email) => email.isPrimary);

  if (primaryEmail) {
    return primaryEmail;
  }

  const headEmail = emails[0];

  if (headEmail) {
    return headEmail;
  }

  return null;
}
