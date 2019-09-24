import typeOf from 'typeof';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import isNull from 'lodash/isNull';
import binarySearch from 'binary-search';
import { ObjectId } from 'mongodb';
import flow from 'lodash/fp/flow';
import sortBy from 'lodash/fp/sortBy';
import sortedUniqBy from 'lodash/fp/sortedUniqBy';

/**
 * Sorts and deduplicates the supplied user permissions array - does not mutate original array.
 * @param {[Object]} haystack array of user permissions
 * @returns {[Object]} new array with sorted user permissions
 */
export const sortDedup = flow(
  sortBy(['name', 'orgId', 'resourceId']),
  sortedUniqBy((permission) => [permission.name, permission.orgId, permission.resourceId].join(' '))
);

/**
 * Finds and returns the index of the user permission object that matches the specified properties.
 * @param {[Object]} haystack sorted array of user permissions to inspect
 * @param {Object} needle matching properties
 * @prop {string} needle.name permission name
 * @prop {string|ObjectId} [needle.orgId] permission orgId (optional)
 * @returns {number}
 */
export function findIndex(haystack, needle) {
  if (!isPlainObject(needle)) {
    throw new TypeError(`Invalid "needle" param; expected object, received ${typeOf(needle)}`);
  }

  let { name, orgId } = needle;

  if (!isString(name)) {
    throw new TypeError(`Invalid name prop; expected string, received ${typeOf(name)}`);
  }

  if (orgId !== undefined) {
    if (orgId instanceof ObjectId) {
      orgId = orgId.toHexString(); // convert to string
    } else if (!isString(orgId) && !isNull(orgId)) {
      throw new TypeError(
        `Invalid orgId prop; expected string, ObjectId or null, received ${typeOf(orgId)}`
      );
    }
  }

  const index = binarySearch(
    haystack,
    {
      name,
      orgId,
    },
    (a, b) => {
      const nameComparator = a.name.localeCompare(b.name);

      if (nameComparator !== 0) {
        return nameComparator; // optimization - exit early
      }

      // from here on, name comparator is zero (0), i.e. (a.name === b.name)

      // ensure orgId has been specified
      if (b.orgId === undefined) {
        return 0; // no further checks required
      }

      // handle case (a.orgId === b.orgId === null)
      if (a.orgId === null && b.orgId === null) {
        return 0;
      }

      // handle case (a.orgId === null && b.orgId !== null)
      if (a.orgId === null) {
        return 1;
      }

      // handle case (a.orgId !== null && b.orgId === null)
      if (b.orgId === null) {
        return -1;
      }

      // handle case (a.orgId !== null && b.orgId !== null)
      return a.orgId.localeCompare(b.orgId);
    }
  );

  return Math.max(index, -1);
}

/**
 * Indicates whether the specified properties exist in the designated haystack array.
 * @param {[Object]} haystack sorted array of user permissions to inspect
 * @param {Object} needle matching properties
 * @prop {string} needle.name permission name
 * @prop {string|ObjectId} [needle.orgId] permission orgId (optional)
 * @returns {boolean}
 */
export function includes(haystack, needle) {
  return findIndex(haystack, needle) !== -1;
}

/**
 * Retrieves unique orgs from the designated sorted user-haystack array.
 * @param {[Object]} haystack sorted array of user permissions
 * @param {Object} [needle] matching properties
 * @prop {string} [needle.name] permission name
 * @returns {boolean}
 */
export function getUniqueOrgIds(haystack, needle = {}) {
  if (!isPlainObject(needle)) {
    throw new TypeError(`Invalid "needle" param; expected object, received ${typeOf(needle)}`);
  }

  const set = new Set();
  haystack.forEach((permission) => {
    if (needle.name && needle.name !== permission.name) {
      return; // exit
    }

    set.add(permission.orgId || null);
  });

  return Array.from(set);
}
