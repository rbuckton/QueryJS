/*!
  Copyright 2018 Ron Buckton (rbuckton@chronicles.org)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

import { assert, Registry, GetAsyncSource, CreateAsyncSubquery } from "../internal";
import { PossiblyAsyncQueryable } from "../types";

export function throughAsync<T, U, S extends PossiblyAsyncQueryable<T> = PossiblyAsyncQueryable<T>, R extends PossiblyAsyncQueryable<U> = PossiblyAsyncQueryable<U>>(source: S, callback: (source: S) => R): R {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(callback, "callback");
    return callback(source);
}

Registry.AsyncQuery.registerCustom("through", throughAsync, function (callback) {
    return CreateAsyncSubquery(this, throughAsync(GetAsyncSource(this), callback as <S, R>(source: S) => R));
});