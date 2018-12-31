/* eslint-env jest */
import mongoose from 'mongoose';
import { delay } from 'awaiting';
import SettingsStore from './SettingsStore';
import Schema from '../models/Settings';
import config from '../../yeep.config';

describe('SettingsStore', () => {
  let db;
  let settings;

  beforeAll(async () => {
    db = await mongoose.createConnection(config.mongo.uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      autoIndex: false,
      bufferCommands: false,
    });
    db.model('Settings', Schema);
    settings = new SettingsStore(db);
    await settings.setup();
  });

  afterAll(async () => {
    await settings.teardown();
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
    beforeAll(async () => {
      await settings.set('foo', 123);
    });

    test('removes key from settings', async () => {
      await settings.delete('foo');

      // ensure key does not exist
      await expect(settings.get('foo')).rejects.toThrow();
    });
  });

  test('updates cache on external changes', async () => {
    // add new prop
    await db.model('Settings').updateOne(
      {},
      {
        $set: { bar: 123 },
      }
    );
    await delay(100);
    const value = await settings.get('bar');
    expect(value).toEqual(123);

    // update prop
    await db.model('Settings').updateOne(
      {},
      {
        $set: { bar: 321 },
      }
    );
    await delay(100);
    const updatedValue = await settings.get('bar');
    expect(updatedValue).toEqual(321);

    // remove prop
    await db.model('Settings').updateOne(
      {},
      {
        $unset: { bar: '' },
      }
    );
    await delay(100);
    await expect(settings.get('bar')).rejects.toThrow();
  });
});
