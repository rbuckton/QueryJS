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

import { assert } from "../internal";
import { AsyncHierarchyIterable, PossiblyAsyncHierarchyIterable, AsyncQueryable } from "../types";
import { filterByAsync } from './filterByAsync';
import { identity } from './common';

/**
 * Creates an [[AsyncHierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filterAsync<TNode, T extends TNode, U extends T>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T, offset: number) => element is U): AsyncHierarchyIterable<TNode, U>;
/**
 * Creates an [[AsyncHierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filterAsync<TNode, U extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode>, predicate: (element: TNode, offset: number) => element is U): AsyncHierarchyIterable<TNode, U>;
/**
 * Creates an [[AsyncHierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] or [[AsyncHierarchyIterable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filterAsync<TNode, T extends TNode>(source: PossiblyAsyncHierarchyIterable<TNode, T>, predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncHierarchyIterable<TNode, T>;
/**
 * Creates an [[AsyncIterable]] whose elements match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filterAsync<T, U extends T>(source: AsyncQueryable<T>, predicate: (element: T, offset: number) => element is U): AsyncIterable<U>;
/**
 * Creates an [[AsyncIterable]] whose elements match the supplied predicate.
 *
 * @param source An [[AsyncQueryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filterAsync<T>(source: AsyncQueryable<T>, predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncIterable<T>;
export function filterAsync<T>(source: AsyncQueryable<T>, predicate: (element: T, offset: number) => boolean | PromiseLike<boolean>): AsyncIterable<T> {
    assert.mustBeAsyncQueryable<T>(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    return filterByAsync(source, identity, predicate);
}