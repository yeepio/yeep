class SettingsStore {
  constructor(db) {
    this.db = db;
  }

  async get(key) {
    // populate internal cache if empty
    if (!this._cache) {
      const SettingsModel = this.db.model('Settings');
      const nextSettings = await SettingsModel.findOne({}, { _id: 0 }, { lean: true });
      this._cache = nextSettings;
    }

    if (!this._cache.hasOwnProperty(key)) {
      throw new Error(`Key "${key}" does not exist in settings`);
    }

    return this._cache[key];
  }

  async set(key, value) {
    const SettingsModel = this.db.model('Settings');
    const nextSettings = await SettingsModel.findOneAndUpdate(
      {},
      {
        $set: {
          [key]: value,
        },
      },
      {
        fields: {
          _id: 0,
        },
        new: true,
        lean: true,
        runValidators: true,
      }
    );

    // update internal cache
    this._cache = nextSettings;
  }

  async delete(key) {
    const SettingsModel = this.db.model('Settings');
    const nextSettings = await SettingsModel.findOneAndUpdate(
      {},
      {
        $unset: {
          [key]: '',
        },
      },
      {
        fields: {
          _id: 0,
        },
        new: true,
        lean: true,
        runValidators: true,
      }
    );

    // update internal cache
    this._cache = nextSettings;
  }
}

export default SettingsStore;
