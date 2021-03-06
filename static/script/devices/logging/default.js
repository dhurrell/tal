/**
 * @fileOverview Requirejs module containing base antie.devices.logging.default class.
 *
 * @preserve Copyright (c) 2013 British Broadcasting Corporation
 * (http://www.bbc.co.uk) and TAL Contributors (1)
 *
 * (1) TAL Contributors are listed in the AUTHORS file and at
 *     https://github.com/fmtvp/TAL/AUTHORS - please extend this file,
 *     not this notice.
 *
 * @license Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * All rights reserved
 * Please contact us for an alternative licence
 */


//logs to the javascript console
require.def(
    'antie/devices/logging/default',
    [
        'module',
        'antie/devices/device'
    ],
    function( Module, Device ) {
        'use strict';

        var loggingMethods = {
            /**
             * Sets the iterator pointer to the first item
             */
            log: function() {
                console.log.apply(console, arguments);
            },
            debug: function() {
                console.debug.apply(console, arguments);
            },
            info: function() {
                console.info.apply(console, arguments);
            },
            warn: function() {
                console.warn.apply(console, arguments);
            },
            error: function() {
                console.error.apply(console, arguments);
            }
        };

        Device.addLoggingStrategy( Module.id, loggingMethods );
    }
);
