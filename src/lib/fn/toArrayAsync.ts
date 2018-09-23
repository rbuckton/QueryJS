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

import { assert, Identity, ToPossiblyAsyncIterable, Registry } from "../internal";
import { PossiblyAsyncQueryable } from "../types";

/**
 * Creates an Array for the elements of the `AsyncIterable`.
 * 
 * @param source An `AsyncIterable` object.
 */
export function toArrayAsync<T>(source: PossiblyAsyncQueryable<T>, elementSelector?: (element: T) => T): Promise<T[]>;

/**
 * Creates an Array for the elements of the `AsyncIterable`.
 *
 * @param source An `AsyncIterable` object.
 * @param elementSelector A callback that selects a value for each element.
 */
export function toArrayAsync<T, V>(source: PossiblyAsyncQueryable<T>, elementSelector: (element: T) => V): Promise<V[]>;

export async function toArrayAsync<T>(source: PossiblyAsyncQueryable<T>, elementSelector: (element: T) => T = Identity): Promise<T[]> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(elementSelector, "elementSelector");
    const result: T[] = [];
    for await (const item of ToPossiblyAsyncIterable(source)) {
        result.push(elementSelector(item));
    }
    return result;
}

Registry.AsyncQuery.registerScalar("toArray", toArrayAsync);