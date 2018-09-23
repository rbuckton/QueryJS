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

import { assert, FlowHierarchy, ToPossiblyAsyncIterable, ToStringTag, Registry } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, PossiblyAsyncQueryable, PossiblyAsyncIterable } from "../types";
import { Set } from "../collections";

/**
 * Creates a subquery for the set union of two Queryables.
 *
 * @param left A Queryable value.
 * @param right A Queryable value.
 */
export function unionAsync<TNode, T extends TNode>(left: PossiblyAsyncHierarchyIterable<TNode, T>, right: PossiblyAsyncQueryable<T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the set union of two Queryables.
 *
 * @param left A Queryable value.
 * @param right A Queryable value.
 */
export function unionAsync<TNode, T extends TNode>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncHierarchyIterable<TNode, T>): AsyncHierarchyIterable<TNode, T>;

/**
 * Creates a subquery for the set union of two Queryables.
 *
 * @param left A Queryable value.
 * @param right A Queryable value.
 */
export function unionAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>): AsyncIterable<T>;

export function unionAsync<T>(left: PossiblyAsyncQueryable<T>, right: PossiblyAsyncQueryable<T>): AsyncIterable<T> {
    assert.mustBePossiblyAsyncQueryable(left, "left");
    assert.mustBePossiblyAsyncQueryable(right, "right");
    return FlowHierarchy(new AsyncUnionIterable(ToPossiblyAsyncIterable(left), ToPossiblyAsyncIterable(right)), left);
}

@ToStringTag("AsyncUnionIterable")
class AsyncUnionIterable<T> implements AsyncIterable<T> {
    private _left: PossiblyAsyncIterable<T>;
    private _right: PossiblyAsyncIterable<T>;

    constructor(left: PossiblyAsyncIterable<T>, right: PossiblyAsyncIterable<T>) {
        this._left = left;
        this._right = right;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const set = new Set<T>();
        for await (const element of this._left) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
        for await (const element of this._right) {
            if (!set.has(element)) {
                set.add(element);
                yield element;
            }
        }
    }
}

Registry.AsyncQuery.registerSubquery("union", unionAsync);