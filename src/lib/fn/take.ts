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

import { assert, ToIterable, FlowHierarchy, ToStringTag} from "../internal";
import { Queryable, HierarchyIterable } from "../types";

/**
 * Creates a subquery containing the first elements up to the supplied
 * count.
 *
 * @param source A [[Queryable]] object.
 * @param count The number of elements to take.
 * @category Subquery
 */
export function take<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, count: number): HierarchyIterable<TNode, T>;
/**
 * Creates a subquery containing the first elements up to the supplied
 * count.
 *
 * @param source A [[Queryable]] object.
 * @param count The number of elements to take.
 * @category Subquery
 */
export function take<T>(source: Queryable<T>, count: number): Iterable<T>;
export function take<T>(source: Queryable<T>, count: number): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBePositiveFiniteNumber(count, "count");
    return FlowHierarchy(new TakeIterable(ToIterable(source), count), source);
}

@ToStringTag("TakeIterable")
class TakeIterable<T> implements Iterable<T> {
    private _source: Iterable<T>;
    private _count: number;

    constructor(source: Iterable<T>, count: number) {
        this._source = source;
        this._count = count;
    }

    *[Symbol.iterator](): Iterator<T> {
        let remaining = this._count;
        if (remaining > 0) {
            for (const element of this._source) {
                yield element;
                if (--remaining <= 0) {
                    break;
                }
            }
        }
    }
}
