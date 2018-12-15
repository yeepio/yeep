export const up = async (db) => {
  await db.createCollection('orgs');
};

export const down = async (db) => {
  await db.dropCollection('orgs');
};
