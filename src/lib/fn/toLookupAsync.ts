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
/** @module "iterable-query/fn" */

import { assert, Identity, CreateGroupingsAsync, Registry } from "../internal";
import { AsyncQueryable } from "../types";
import { Lookup } from "../lookup";

/**
 * Creates a Lookup for the elements of the source.
 *
 * @param source An `AsyncQueryable` object.
 * @param keySelector A callback used to select a key for each element.
 * @category Scalar
 */
export async function toLookupAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K): Promise<Lookup<K, T>>;
/**
 * Creates a Lookup for the elements of the source.
 *
 * @param source An `AsyncQueryable` object.
 * @param keySelector A callback used to select a key for each element.
 * @param elementSelector A callback that selects a value for each element.
 * @category Scalar
 */
export async function toLookupAsync<T, K, V>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Promise<Lookup<K, V>>;
export async function toLookupAsync<T, K>(source: AsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => T = Identity): Promise<Lookup<K, T>> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    return new Lookup(await CreateGroupingsAsync(source, keySelector, elementSelector));
}

Registry.AsyncQuery.registerScalar("toLookup", toLookupAsync);