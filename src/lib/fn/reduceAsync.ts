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

import { assert, ToPossiblyAsyncIterable } from "../internal";
import { AsyncQueryable } from "../types";
import { identity } from "./common";

/**
 * Computes a scalar value by applying an accumulator callback over each element.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param accumulator the callback used to compute the result.
 * @category Scalar
 */
export function reduceAsync<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>): Promise<T>;
/**
 * Computes a scalar value by applying an accumulator callback over each element.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param accumulator the callback used to compute the result.
 * @category Scalar
 * @param seed An optional seed value.
 */
export function reduceAsync<T, U>(source: AsyncQueryable<T>, accumulator: (current: U, element: T, offset: number) => U | PromiseLike<U>, seed: U): Promise<U>;
/**
 * Computes a scalar value by applying an accumulator callback over each element.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param accumulator the callback used to compute the result.
 * @param seed An optional seed value.
 * @param resultSelector An optional callback used to compute the final result.
 * @category Scalar
 */
export function reduceAsync<T, U, R>(source: AsyncQueryable<T>, accumulator: (current: U, element: T, offset: number) => U | PromiseLike<T>, seed: U, resultSelector: (result: U, count: number) => R | PromiseLike<R>): Promise<R>;
export function reduceAsync<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>, seed?: T, resultSelector: (result: T, count: number) => T | PromiseLike<T> = identity): Promise<T> {
    return reduceAsyncCore(source, accumulator, seed, arguments.length > 2, resultSelector);
}

async function reduceAsyncCore<T>(source: AsyncQueryable<T>, accumulator: (current: T, element: T, offset: number) => T | PromiseLike<T>, current: T | undefined, hasCurrent: boolean, resultSelector: (result: T, count: number) => T | PromiseLike<T>): Promise<T> {
    assert.mustBeAsyncQueryable(source, "source");
    assert.mustBeFunction(accumulator, "accumulator");
    assert.mustBeFunction(resultSelector, "resultSelector");
    let count = 0;
    for await (const value of ToPossiblyAsyncIterable(source)) {
        if (!hasCurrent) {
            hasCurrent = true;
            current = value;
        }
        else {
            current = await accumulator(current!, value, count);
        }
        count++;
    }
    return resultSelector(current!, count);
}