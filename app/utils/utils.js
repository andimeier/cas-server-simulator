'use strict';

/**
 * Utility class.
 * @class utils
 * @type {exports}
 */
var changeCase = require('change-case');
var crypto = require('crypto');
var _ = require('lodash');
var q = require('q');


/**
 * returns a random filename
 *
 * @return {promise} a promise resolving into a random filename
 */
exports.getRandomFilename = function () {
    return q.nfcall(crypto.pseudoRandomBytes, 16)
        .then(function (raw) {
            return raw.toString('hex');
        });
};

/**
 * changes all keys in an object to camel case.
 * Use case: change all column names in a row object to camel case.
 *
 * @param row {object} object whose keys will be camel cased
 * @return {object} the object with camel cased keys
 */
exports.mapToCamelCase = function (row) {
    return _.mapKeys(row, function (value, key) {
        return changeCase.camel(key);
    });
};

/**
 * converts separate "version levels" to a version string
 *
 * @param versionLevels {object} object containing the properties "version_major", "version_minor", "version_patch"
 *   and "version_build"
 * @returns {string} the assembled version string.
 */
exports.assembleVersion = function (versionLevels) {
    // provide assembled version string
    return _.map(['major', 'minor', 'patch', 'build'], function (level) {
            return versionLevels['version_' + level];
        })
        .join('.')
        .replace(/\.*$/, '');
};


/**
 * splits a version string into its version parts
 *
 * @param versionString {string} version string, e.g. '1.5.0.3'
 * @return {object} version object containing of the properties:
 *   version_major
 *   version_minor
 *   version_patch
 *   version_build
 */
exports.splitVersion = function (versionString) {
    let versionParts = (versionString || '').split('.');

    return {
        version_major: versionParts[0] || 0,
        version_minor: versionParts[1] || 0,
        version_patch: versionParts[2],
        version_build: versionParts[3]
    };
};
