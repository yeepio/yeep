import typeOf from 'typeof';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import isNull from 'lodash/isNull';
import binarySearch from 'binary-search';
import { ObjectId } from 'mongodb';

/**
 * Finds and returns the index of the user permission object that matches the specified properties.
 * @param {Array<Object>} haystack array of user haystack to inspect
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
    (a, b) =>
      a.name.localeCompare(b.name) ||
      (b.orgId === undefined ? 0 : (a.orgId || '').localeCompare(b.orgId || ''))
  );

  return Math.max(index, -1);
}

/**
 * Indicates whether the specified properties exist in the designated haystack array.
 * @param {Array<Object>} haystack array of user haystack to inspect
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
 * @param {Array<Object>} haystack sorted array of user-haystack
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
