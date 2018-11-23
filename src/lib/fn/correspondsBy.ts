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

import { assert, SameValueZero, GetIterator, ToIterable, IteratorClose} from "../internal";
import { Queryable } from "../types";

/**
 * Computes a scalar value indicating whether the key for every element in `left` corresponds to a matching key
 * in `right` at the same position.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param keySelector A callback used to select the key for each element.
 * @category Scalar
 */
export function correspondsBy<T, K>(left: Queryable<T>, right: Queryable<T>, keySelector: (element: T) => K): boolean;
/**
 * Computes a scalar value indicating whether the key for every element in `left` corresponds to a matching key
 * in `right` at the same position.
 *
 * @param left A [[Queryable]] object.
 * @param right A [[Queryable]] object.
 * @param leftKeySelector A callback used to select the key for each element in `left`.
 * @param rightKeySelector A callback used to select the key for each element in `right`.
 * @param equalityComparison An optional callback used to compare the equality of two keys.
 * @category Scalar
 */
export function correspondsBy<T, U, K>(left: Queryable<T>, right: Queryable<U>, leftKeySelector: (element: T) => K, rightKeySelector: (element: U) => K, equalityComparison?: (left: K, right: K) => boolean): boolean;
export function correspondsBy<T, K>(left: Queryable<T>, right: Queryable<T>, leftKeySelector: (element: T) => K, rightKeySelector: (element: T) => K = leftKeySelector, equalityComparison: (left: K, right: K) => boolean = SameValueZero): boolean {
    assert.mustBeQueryable(left, "left");
    assert.mustBeQueryable(right, "right");
    assert.mustBeFunction(leftKeySelector, "leftKeySelector");
    assert.mustBeFunction(equalityComparison, "equalityComparison");
    const leftIterator = GetIterator(ToIterable(left));
    let leftDone = false;
    let leftValue: T;
    try {
        const rightIterator = GetIterator(ToIterable(right));
        let rightDone = false;
        let rightValue: T;
        try {
            for (;;) {
                ({ done: leftDone, value: leftValue } = leftIterator.next());
                ({ done: rightDone, value: rightValue } = rightIterator.next());
                if (leftDone && rightDone) return true;
                if (Boolean(leftDone) !== Boolean(rightDone) || !equalityComparison(leftKeySelector(leftValue), rightKeySelector(rightValue))) return false;
            }
        }
        finally {
            if (!rightDone) IteratorClose(rightIterator);
        }
    }
    finally {
        if (!leftDone) IteratorClose(leftIterator);
    }
}