export const up = async (db) => {
  await db.createCollection('orgMemberships');
};

export const down = async (db) => {
  await db.dropCollection('orgMemberships');
};
