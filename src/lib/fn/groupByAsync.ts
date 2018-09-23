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

import { assert, Identity, CreateGrouping, ToPossiblyAsyncIterable, CreateGroupingsAsync, ToStringTag, Registry, GetAsyncSource, CreateSubquery, CreateAsyncSubquery, FlowHierarchy } from "../internal";
import { PossiblyAsyncQueryable, PossiblyAsyncIterable, Grouping, PossiblyAsyncHierarchyIterable, HierarchyGrouping, Queryable, AsyncQuerySource } from "../types";

/**
 * Groups each element of this Query by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 */
export function groupByAsync<T, K>(source: PossiblyAsyncHierarchyIterable<T>, keySelector: (element: T) => K): AsyncIterable<HierarchyGrouping<K, T>>;

/**
 * Groups each element of this Query by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 */
export function groupByAsync<T, K>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K): AsyncIterable<Grouping<K, T>>;

/**
 * Groups each element by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 */
export function groupByAsync<T, K, V>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): AsyncIterable<Grouping<K, V>>;

/**
 * Groups each element by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param resultSelector A callback used to select a result from a group.
 */
export function groupByAsync<T, K, V, R>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<V>) => R): AsyncIterable<R>;

/** @internal */ export function groupByAsync<T, K>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector?: (element: T) => T, resultSelector?: (key: K, elements: Iterable<T>) => Grouping<K, T>): AsyncIterable<Grouping<K, T>>;

/**
 * Groups each element by its key.
 *
 * @param keySelector A callback used to select the key for an element.
 * @param elementSelector A callback used to select a value for an element.
 * @param resultSelector A callback used to select a result from a group.
 */
export function groupByAsync<T, K, V, R>(source: PossiblyAsyncQueryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => T | V = Identity, resultSelector: (key: K, elements: Iterable<T | V>) => Grouping<K, T | V> | R = CreateGrouping): AsyncIterable<Grouping<K, T | V> | R> {
    assert.mustBePossiblyAsyncQueryable(source, "source");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    source = ToPossiblyAsyncIterable(source);
    return new AsyncGroupByIterable(source, keySelector, elementSelector, resultSelector);
}

@ToStringTag("AsyncGroupByIterable")
class AsyncGroupByIterable<T, K, V, R> implements AsyncIterable<R> {
    private _source: PossiblyAsyncIterable<T>;
    private _keySelector: (element: T) => K;
    private _elementSelector: (element: T) => T | V;
    private _resultSelector: (key: K, elements: Iterable<T | V>) => R;

    constructor(source: PossiblyAsyncIterable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<T | V>) => R) {
        this._source = source;
        this._keySelector = keySelector;
        this._elementSelector = elementSelector;
        this._resultSelector = resultSelector;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<R> {
        const source = this._source;
        const elementSelector = this._elementSelector;
        const resultSelector = this._resultSelector;
        const map = await CreateGroupingsAsync(source, this._keySelector, this._elementSelector);
        for (const [key, values] of map) {
            yield resultSelector(key, elementSelector === Identity ? FlowHierarchy(values, source) : values);
        }
    }
}

Registry.AsyncQuery.registerCustom("groupBy", groupByAsync, function (keySelector, elementSelector = Identity, resultSelector = CreateGrouping) {
    assert.mustBeAsyncQuerySource(this, "this");
    assert.mustBeFunction(keySelector, "keySelector");
    assert.mustBeFunction(elementSelector, "elementSelector");
    assert.mustBeFunction(resultSelector, "resultSelector");
    return CreateAsyncSubquery(this, new AsyncGroupByIterable(
        ToPossiblyAsyncIterable(GetAsyncSource(this)),
        keySelector,
        elementSelector,
        resultSelector === CreateGrouping ? CreateGrouping : (key, values) => resultSelector(key, CreateSubquery(this, values))));
});