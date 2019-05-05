export const up = async (db) => {
  await db.createCollection('identityProviders');
};

export const down = async (db) => {
  await db.dropCollection('identityProviders');
};
