const {DateTime} = require('luxon');
const slugify = require('slugify');

const config = require(__basedir + '/.cache/config.json');
const utils = require(__basedir + '/app/functions/utils');

/**
 * Convert x-www-form-urlencoded body to Microformats 2 JSON object
 *
 * @param {String} body x-www-form-urlencoded body
 * @return {Object} Microformats 2 JSON object
 *
 */
exports.convertFormEncodedToMf2 = function (body) {
  const reservedProperties = Object.freeze([
    'access_token',
    'h',
    'action',
    'url'
  ]);

  const result = {
    type: body.h ? ['h-' + body.h] : ['h-entry'],
    properties: {},
    mp: {}
  };

  if (body.h) {
    delete body.h;
  }

  for (let key in body) {
    if (Object.hasOwnProperty.call(body, key)) {
      const isReservedProperty = reservedProperties.indexOf(key) !== -1;
      const isExtendedProperty = key.indexOf('mp-') === 0;

      let value = body[key];
      value = utils.decodeFormEncodedString(value);

      if (isReservedProperty) {
        result[key] = value;
      } else {
        let targetProperty;

        if (isExtendedProperty) {
          key = key.substr(3);
          targetProperty = result.mp;
        } else {
          targetProperty = result.properties;
        }

        targetProperty[key] = [].concat(value);
      }
    }
  }

  utils.removeEmptyObjectKeys(result);

  return result;
};

/**
 * Return slugified string
 *
 * @param {String} mf2 Microformats 2 JSON object
 * @param {String} separator Slug sepatator
 * @returns {String} Slugified string
 *
 */
exports.getSlug = function (mf2, separator) {
  let slug;
  const hasSlug = ((mf2 || {}).mp || {}).slug;
  const hasTitle = ((mf2 || {}).properties || {}).name;

  if (hasSlug) {
    slug = mf2.mp.slug[0];
  }

  if (hasTitle) {
    slug = slugify(mf2.properties.name[0], {
      replacement: separator,
      lower: true
    });
  }

  slug = Math.floor(Math.random() * 90000) + 10000;
  return [slug];
};

/**
 * Return ISO formatted date
 *
 * @param {String} mf2 Microformats 2 JSON object
 * @returns {String} ISO formatted date
 *
 */
exports.getDate = function (mf2) {
  try {
    const published = mf2.properties.published[0];
    return new Array(published.toISO());
  } catch (error) {
    return new Array(DateTime.local().toISO());
  }
};

/**
 * Return object containing error data
 *
 * @param {String} id Identifier
 * @returns {Object} Error object
 *
 */
exports.errorResponse = function (id) {
  let code;
  let desc;

  switch (id) {
    case ('not_supported'):
      code = 404;
      desc = 'Request is not currently supported';
      break;
    case ('forbidden'):
      code = 403;
      desc = 'User does not have permission to perform request';
      break;
    case ('unauthorized'):
      code = 401;
      desc = 'No access token provided in request';
      break;
    case ('insufficient_scope'):
      code = 401;
      desc = 'Scope of access token does not meet requirements for request';
      break;
    case ('invalid_request'):
      code = 400;
      desc = 'Request is missing required parameter, or there was a problem with value of one of the parameters provided';
      break;
    default:
      id = 'server_error';
      code = 500;
      desc = 'Server error';
  }

  return {
    code,
    json: {
      error: id,
      error_description: desc
    }
  };
};

/**
 * Return object containing error data
 *
 * @param {String} id Identifier
 * @param {String} location Location of post
 * @returns {Object} Success object
 *
 */
exports.successResponse = function (id, location) {
  let code;
  let desc;

  switch (id) {
    case ('create'):
      code = 201;
      desc = `Post created at ${location}`;
      break;
    case ('create_pending'):
      code = 202;
      desc = `Post will be created at ${location}`;
      break;
    case ('update'):
      code = 200;
      desc = `Post updated at ${location}`;
      break;
    case ('update_created'):
      code = 201;
      desc = `Post updated and moved to ${location}`;
      break;
    case ('delete'):
      code = 200;
      desc = `Post deleted from ${location}`;
      break;
    case ('delete_undelete'):
      code = 201;
      desc = `Post undeleted from ${location}`;
      break;
    default:
      code = 200;
      desc = 'Success';
  }

  return {
    code,
    location,
    json: {
      success: id,
      success_description: desc
    }
  };
};

/**
 * Return object containing error data
 *
 * @param {String} query Identifier
 * @param {String} appUrl URL of application
 * @returns {Object} Success object
 *
 */
exports.queryResponse = function (query, appUrl) {
  let code;
  let json;

  const mediaEndpoint = config['media-endpoint'] || `${appUrl}/media`;
  const syndicateTo = config['syndicate-to'] || [];

  switch (query) {
    case ('config'):
      code = 200;
      json = {
        'media-endpoint': mediaEndpoint,
        'syndicate-to': syndicateTo
      };
      break;
    case ('source'):
      return module.exports.errorResponse('not_supported');
    case ('syndicate-to'):
      code = 200;
      json = {
        'syndicate-to': syndicateTo
      };
      break;
    default:
      return module.exports.errorResponse('invalid_request');
  }

  return {
    code,
    json
  };
};
