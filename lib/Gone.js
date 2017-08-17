/*******************************************************************************
 * Copyright (c) 2017 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 ******************************************************************************/

'use strict'

const _ = require('underscore')

module.exports = Gone

// Cached regular expressions for matching named param parts and splatted
// parts of route strings.
const optionalParam = /\((.*?)\)/g
const namedParam    = /(\(\?)?:\w+/g
const splatParam    = /\*\w+/g
const escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g

// Convert a route string into a regular expression, suitable for matching
// against the current location hash.
function _routeToRegExp(route) {
    route = route
    .replace(escapeRegExp, '\\$&')
    .replace(optionalParam, '(?:$1)?')
    .replace(namedParam, function(match, optional) {
        return optional ? match : '([^/?]+)'
    })
    .replace(splatParam, '([^?]*?)')
    return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$')
}

function Gone(options = {}) {
    this._locator = window
    this._strict = false
    if (options.strict === true || options.strict === false) {
        this._strict = options.strict
    }
}

Gone.prototype.went = function went (route, cb) {
    if (!_.isString(route)) {
        throw new TypeError('Parameter route must be a valid string.')
    }
    if (!_.isFunction(cb)) {
        throw new TypeError('Parameter cb must be a function.')
    }
    let location = this._locator.location
    let path = location.pathname
    if (!this._strict) {
        if (route.endsWith('/')) {
            route = route.substring(0, route.length - 1)
        } 
        if (path.endsWith('/')) {
            path = path.substring(0, path.length - 1)
        }
    }
    if (_routeToRegExp(route).test(path)) {
        cb()
    }
    return this
}