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
import { Queryable, HierarchyIterable } from "../types";
import { filterBy } from './filterBy';
import { identity } from './common';

/**
 * Creates a [[HierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filter<TNode, T extends TNode, U extends T>(source: HierarchyIterable<TNode, T>, predicate: (element: T, offset: number) => element is U): HierarchyIterable<TNode, U>;
/**
 * Creates a [[HierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filter<TNode, U extends TNode>(source: HierarchyIterable<TNode>, predicate: (element: TNode, offset: number) => element is U): HierarchyIterable<TNode, U>;
/**
 * Creates a [[HierarchyIterable]] whose elements match the supplied predicate.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filter<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, predicate: (element: T, offset: number) => boolean): HierarchyIterable<TNode, T>;
/**
 * Creates an [[Iterable]] whose elements match the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filter<T, U extends T>(source: Queryable<T>, predicate: (element: T, offset: number) => element is U): Iterable<U>;
/**
 * Creates an [[Iterable]] whose elements match the supplied predicate.
 *
 * @param source A [[Queryable]] object.
 * @param predicate A callback used to match each element.
 * @category Subquery
 */
export function filter<T>(source: Queryable<T>, predicate: (element: T, offset: number) => boolean): Iterable<T>;
export function filter<T>(source: Queryable<T>, predicate: (element: T, offset: number) => boolean): Iterable<T> {
    assert.mustBeQueryable(source, "source");
    assert.mustBeFunction(predicate, "predicate");
    return filterBy(source, identity, predicate);
}