export const up = async (db) => {
  await db.createCollection('authFactors');
};

export const down = async (db) => {
  await db.dropCollection('authFactors');
};
