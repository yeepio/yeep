/* eslint-env jest */
import mongoose from 'mongoose';
import SettingsStore from './SettingsStore';
import Schema from '../models/Settings';

describe('SettingsStore', () => {
  let db;
  let settings;

  beforeAll(async () => {
    db = await mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      autoIndex: false,
      bufferCommands: false,
    });
    db.model('Settings', Schema);
    settings = new SettingsStore(db);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('get', () => {
    test('throws error when key does not exist', async () => {
      await expect(settings.get('known_unknown')).rejects.toThrow(
        'Key "known_unknown" does not exist in settings'
      );
    });

    test('retrieves key from internal settings cache', async () => {
      const record = await db.model('Settings').findOne({}, { _id: 0 }, { lean: true });
      const [entry] = Object.entries(record);
      const value = await settings.get(entry[0]);
      expect(value).toEqual(entry[1]);
    });
  });

  describe('set', () => {
    afterAll(async () => {
      await settings.delete('foo');
    });

    test('creates or updates key in settings', async () => {
      // ensure key does not already exist
      await expect(settings.get('foo')).rejects.toThrow();

      // create key on first #set()
      await settings.set('foo', 123);
      const value = await settings.get('foo');
      expect(value).toEqual(123);

      // update key on second #set()
      await settings.set('foo', 321);
      const nextValue = await settings.get('foo');
      expect(nextValue).toEqual(321);
    });
  });

  describe('delete', () => {
    afterAll(async () => {
      await settings.set('foo', 123);
    });

    test('removes key from settings', async () => {
      await settings.delete('foo');

      // ensure key does not exist
      await expect(settings.get('foo')).rejects.toThrow();
    });
  });
});
