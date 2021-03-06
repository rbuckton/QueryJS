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

import { assert, ToPossiblyAsyncIterable, FlowHierarchy, ToStringTag } from "../internal";
import { PossiblyAsyncHierarchyIterable, AsyncHierarchyIterable, PossiblyAsyncIterable, AsyncQueryable } from "../types";

/**
 * Creates an [[AsyncHierarchyIterable]] that contains the provided default value if `source`
 * contains no elements.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param defaultValue The default value.
 * @category Subquery
 */
export function defaultIfEmptyAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, defaultValue: PromiseLike<T> | T): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] that contains the provided default value if `source`
 * contains no elements.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param defaultValue The default value.
 * @category Subquery
 */
export function defaultIfEmptyAsync<T>(source: AsyncQueryable<T>, defaultValue: PromiseLike<T> | T): AsyncIterable<T>;
export function defaultIfEmptyAsync<T>(source: AsyncQueryable<T>, defaultValue: PromiseLike<T> | T): AsyncIterable<T> {
    assert.mustBeAsyncQueryable(source, "source");
    return FlowHierarchy(new AsyncDefaultIfEmptyIterable(ToPossiblyAsyncIterable(source), defaultValue), source);
}

@ToStringTag("AsyncDefaultIfEmptyIterable")
class AsyncDefaultIfEmptyIterable<T> implements AsyncIterable<T> {
    private _source: PossiblyAsyncIterable<T>;
    private _defaultValue: PromiseLike<T> | T;

    constructor(source: PossiblyAsyncIterable<T>, defaultValue: PromiseLike<T> | T) {
        this._source = source;
        this._defaultValue = defaultValue;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        const source = this._source;
        const defaultValue = this._defaultValue;
        let hasElements = false;
        for await (const value of source) {
            hasElements = true;
            yield value;
        }
        if (!hasElements) {
            yield defaultValue;
        }
    }
}