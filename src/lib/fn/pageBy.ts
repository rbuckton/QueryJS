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

import { assert, ToIterable, ToStringTag, CreatePage } from "../internal";
import { Queryable, Page, HierarchyIterable, HierarchyPage } from "../types";

/**
 * Creates a [[HierarchyIterable]] that splits a [[Queryable]] into one or more pages.
 * While advancing from page to page is evaluated lazily, the elements of the page are
 * evaluated eagerly.
 *
 * @param source A [[HierarchyIterable]] object.
 * @param pageSize The number of elements per page.
 * @category Subquery
 */
export function pageBy<TNode, T extends TNode>(source: HierarchyIterable<TNode, T>, pageSize: number): Iterable<HierarchyPage<TNode, T>>;
/**
 * Creates an [[Iterable]] that splits a [[Queryable]] into one or more pages.
 * While advancing from page to page is evaluated lazily, the elements of the page are
 * evaluated eagerly.
 *
 * @param source A [[Queryable]] object.
 * @param pageSize The number of elements per page.
 * @category Subquery
 */
export function pageBy<T>(source: Queryable<T>, pageSize: number): Iterable<Page<T>>;
export function pageBy<T>(source: Queryable<T>, pageSize: number): Iterable<Page<T>> {
    assert.mustBeQueryable(source, "source");
    assert.mustBePositiveNonZeroFiniteNumber(pageSize, "pageSize");
    return new PageByIterable(ToIterable(source), pageSize);
}

@ToStringTag("PageByIterable")
class PageByIterable<T> implements Iterable<Page<T>> {
    private _source: Iterable<T>;
    private _pageSize: number;

    constructor(source: Iterable<T>, pageSize: number) {
        this._source = source;
        this._pageSize = pageSize;
    }

    *[Symbol.iterator](): Iterator<Page<T>> {
        const pageSize = this._pageSize;
        let elements: T[] = [];
        let page = 0;
        for (const value of this._source) {
            elements.push(value);
            if (elements.length >= pageSize) {
                yield CreatePage(page, page * pageSize, elements);
                elements = [];
                page++;
            }
        }
        if (elements.length > 0) {
            yield CreatePage(page, page * pageSize, elements);
        }
    }
}
