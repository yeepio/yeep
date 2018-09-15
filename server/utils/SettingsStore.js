import omit from 'lodash/fp/omit';

const omitId = omit('_id');

class SettingsStore {
  constructor(db) {
    const SettingsModel = db.model('Settings');
    this.model = SettingsModel;
    this.cache = {};
  }

  async setup() {
    // initialize internal cache
    this.cache = await this.model.findOne({}, { _id: 0 }, { lean: true });

    // create change stream
    const changeStream = this.model.watch({
      fullDocument: 'updateLookup',
    });

    // watch for external changes to settings
    changeStream
      .on('change', (change) => {
        // update cache
        this.cache = omitId(change.fullDocument);
      })
      .on('error', (err) => {
        if (err.codeName !== 'CursorKilled') {
          console.error(err);
        }
      });

    // store changeStream reference
    this.changeStream = changeStream;
  }

  async teardown() {
    // explicitely close changeStream to avoid stupid MongoNetworkError
    await this.changeStream.driverChangeStream.close();
  }

  async get(key) {
    if (!this.cache.hasOwnProperty(key)) {
      throw new Error(`Key "${key}" does not exist in settings`);
    }

    return this.cache[key];
  }

  async set(key, value) {
    const nextSettings = await this.model.findOneAndUpdate(
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
    this.cache = nextSettings;
  }

  async delete(key) {
    const nextSettings = await this.model.findOneAndUpdate(
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
    this.cache = nextSettings;
  }
}

export default SettingsStore;
