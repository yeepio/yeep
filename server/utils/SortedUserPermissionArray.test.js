/* eslint-env jest */
import { findIndex, includes, getUniqueOrgIds } from './SortedUserPermissionArray';

describe('SortedUserPermissionArray', () => {
  const permissions = [
    {
      name: 'yeep.test.1',
      orgId: 'abc',
    },
    {
      name: 'yeep.test.1',
      orgId: 'def',
    },
    {
      name: 'yeep.test.2',
      orgId: null,
    },
    {
      name: 'yeep.test.2',
      orgId: 'abc',
    },
  ];

  describe('findIndex', () => {
    test('returns integer >= 0 when there is match', () => {
      expect(findIndex(permissions, { name: 'yeep.test.1' })).toEqual(1);
      expect(findIndex(permissions, { name: 'yeep.test.2', orgId: null })).toEqual(2);
      expect(findIndex(permissions, { name: 'yeep.test.1', orgId: 'abc' })).toEqual(0);
      expect(findIndex(permissions, { name: 'yeep.test.2', orgId: 'abc' })).toEqual(3);
    });

    test('returns -1 when there is no match', () => {
      expect(findIndex(permissions, { name: 'yeep.test.3' })).toEqual(-1);
      expect(findIndex(permissions, { name: 'yeep.test.2', orgId: 'def' })).toEqual(-1);
      expect(findIndex(permissions, { name: 'yeep.test.1', orgId: null })).toEqual(-1);
    });

    test('throws error when name is undefined', () => {
      expect(() => findIndex(permissions, {})).toThrow();
    });

    test('throws error when orgId is invalid', () => {
      expect(() => findIndex(permissions, { name: 'str', orgId: false })).toThrow();
      expect(() => findIndex(permissions, { name: 'str', orgId: {} })).toThrow();
      expect(() => findIndex(permissions, { name: 'str', orgId: 123 })).toThrow();
    });
  });

  describe('includes', () => {
    test('returns true when there is match', () => {
      expect(includes(permissions, { name: 'yeep.test.1' })).toEqual(true);
      expect(includes(permissions, { name: 'yeep.test.2', orgId: null })).toEqual(true);
      expect(includes(permissions, { name: 'yeep.test.1', orgId: 'abc' })).toEqual(true);
      expect(includes(permissions, { name: 'yeep.test.2', orgId: 'abc' })).toEqual(true);
    });

    test('returns false when there is no match', () => {
      expect(includes(permissions, { name: 'yeep.test.3' })).toEqual(false);
      expect(includes(permissions, { name: 'yeep.test.2', orgId: 'def' })).toEqual(false);
      expect(includes(permissions, { name: 'yeep.test.1', orgId: null })).toEqual(false);
    });

    test('throws error when name is undefined', () => {
      expect(() => includes(permissions, {})).toThrow();
    });

    test('throws error when orgId is invalid', () => {
      expect(() => includes(permissions, { name: 'str', orgId: false })).toThrow();
      expect(() => includes(permissions, { name: 'str', orgId: {} })).toThrow();
      expect(() => includes(permissions, { name: 'str', orgId: 123 })).toThrow();
    });
  });

  describe('getUniqueOrgIds', () => {
    test('returns array of unique org IDs', () => {
      expect(getUniqueOrgIds(permissions)).toEqual(['abc', 'def', null]);
    });

    test('accepts permission name filter', () => {
      expect(getUniqueOrgIds(permissions, { name: 'yeep.test.1' })).toEqual(['abc', 'def']);
      expect(getUniqueOrgIds(permissions, { name: 'yeep.test.2' })).toEqual([null, 'abc']);
      expect(getUniqueOrgIds(permissions, { name: 'yeep.test.3' })).toEqual([]);
    });
  });
});
