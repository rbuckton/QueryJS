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

import { assert, ToIterable} from "../internal";
import { Queryable } from "../types";
import { Map, Set } from "../collections";
import { T } from "./common";

/**
 * Counts the number of elements, optionally filtering elements using the supplied callback.
 *
 * @param source A [[Queryable]] object.
 * @param predicate An optional callback used to match each element.
 * @category Scalar
 */
export function count<T>(source: Queryable<T>, predicate: (element: T) => boolean = T): number {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");

    if (predicate === T) {
        if (Array.isArray(source)) return source.length;
        if (source instanceof Set || source instanceof Map) return source.size;
    }

    let count = 0;
    for (const element of ToIterable(source)) {
        if (predicate(element)) {
            count++;
        }
    }

    return count;
}