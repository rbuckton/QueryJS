import { assert, expect } from "chai";

interface ErrorConstructorWithStackTraceApi extends ErrorConstructor {
    captureStackTrace(target: any, stackCrawlMark?: Function): void;
}

declare const Error: ErrorConstructorWithStackTraceApi;

function getStack() {
    const stackObj = new Error();
    Error.captureStackTrace(stackObj, getStack);
    return stackObj.stack;
}

export class Lemma<A extends any[]> {
    name: string;
    data: A;
    constructor(name: string, data: A) {
        this.name = name;
        this.data = data;
    }

    static * fromData<A extends any[]>(data: (A | Lemma<A>)[] | Record<string, A>) {
        yield* Array.isArray(data) ? Lemma.fromRows(data) : Lemma.fromRecord(data);
    }

    static * fromRecord<A extends any[]>(data: Record<string, A>) {
        for (const key in data) {
            yield new Lemma(key, data[key]);
        }
    }

    static * fromRows<A extends any[]>(rows: Iterable<A | Lemma<A>>) {
        for (const row of rows) {
            yield Lemma.fromRow(row);
        }
    }

    static fromRow<A extends any[]>(row: A | Lemma<A>) {
        if (row instanceof Lemma) return row;
        const name = `[${row.map(value => 
            typeof value === "function" ? value.name || "<anonymous function>" : 
            (value = JSON.stringify(value), value === undefined ? "undefined" : value === null ? "null" : value)).join(", ")}]`;
        return new Lemma(name, row);
    }
}

function makeTheory<A extends any[]>(fn: Mocha.SuiteFunction | Mocha.PendingSuiteFunction | Mocha.ExclusiveSuiteFunction, name: string, data: A[] | Record<string, A> | ((...args: A) => void), cb: ((...args: A) => void) | A[] | Record<string, A>) {
    const _data = Array.isArray(data) ? data : cb as A[] | Record<string, A>;
    const _cb = typeof cb === "function" ? cb : data as (...args: A) => void;
    fn(name, () => {
        for (const lemma of Lemma.fromData(_data)) {
            it(lemma.name, () => _cb(...lemma.data));
        }
    });
}

type Rest<A extends any[]> = ((...args: A) => void) extends ((first: any, ...rest: infer ARest) => void) ? ARest : never;

function isPromiseLike(value: any): value is PromiseLike<any> {
    return typeof value === "object"
        && typeof value.then === "function";
}

async function awaitThrowsResult(stack: string, error: ErrorConstructorLike, result: PromiseLike<any>) {
    let caught: { error: any } | undefined;
    try {
        await result;
    }
    catch (e) {
        caught = { error: e };
    }
    expectError(stack, error, caught)
}

function expectError(stack: string, error: ErrorConstructorLike, caught: { error: any } | undefined) {
    try {
        expect(() => { if (caught) throw caught.error; }).to.throw(error);
    }
    catch (e) {
        if (stack) e.stack = stack;
        throw e;
    }
}

function makeThrowsTheory<A extends [ErrorConstructorLike, ...any[]], R>(fn: Mocha.SuiteFunction | Mocha.PendingSuiteFunction | Mocha.ExclusiveSuiteFunction, name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
    const stack = getStack();
    makeTheory<any[]>(fn, name, (error, ...args: any[]) => {
        let caught: { error: any } | undefined;
        try {
            const result = cb(...args as Rest<A>);
            if (isPromiseLike(result)) {
                return awaitThrowsResult(stack, error, result);
            }
        }
        catch (e) {
            caught = { error: e };
        }
        expectError(stack, error, caught);
    }, data);
}

export function theory<A extends any[], R>(name: string, data: A[] | Record<string, A>, cb: (...args: A) => R | PromiseLike<R>): void;
export function theory<A extends any[], R>(name: string, cb: (...args: A) => R | PromiseLike<R>, data: A[] | Record<string, A>): void;
export function theory<A extends any[], R>(name: string, data: A[] | Record<string, A> | ((...args: A) => R | PromiseLike<R>), cb: ((...args: A) => R | PromiseLike<R>) | A[] | Record<string, A>) {
    makeTheory(describe, name, data, cb);
}

export namespace theory {
    export function skip<A extends any[], R>(name: string, data: A[] | Record<string, A>, cb: (...args: A) => R | PromiseLike<R>): void;
    export function skip<A extends any[], R>(name: string, cb: (...args: A) => R | PromiseLike<R>, data: A[] | Record<string, A>): void;
    export function skip<A extends any[], R>(name: string, data: A[] | Record<string, A> | ((...args: A) => R | PromiseLike<R>), cb: ((...args: A) => R | PromiseLike<R>) | A[] | Record<string, A>) {
        return makeTheory(describe.skip, name, data, cb);
    }

    export function only<A extends any[], R>(name: string, data: A[] | Record<string, A>, cb: (...args: A) => R | PromiseLike<R>): void;
    export function only<A extends any[], R>(name: string, cb: (...args: A) => R | PromiseLike<R>, data: A[] | Record<string, A>): void;
    export function only<A extends any[], R>(name: string, data: A[] | Record<string, A> | ((...args: A) => R | PromiseLike<R>), cb: ((...args: A) => R | PromiseLike<R>) | A[] | Record<string, A>) {
        return makeTheory(describe.only, name, data, cb);
    }

    export function throws<A extends [ErrorConstructorLike, ...any[]], R>(name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
        makeThrowsTheory(describe, name, cb, data);
    }

    export namespace throws {
        export function skip<A extends [ErrorConstructorLike, ...any[]], R>(name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
            makeThrowsTheory(describe.skip, name, cb, data);
        }

        export function only<A extends [ErrorConstructorLike, ...any[]], R>(name: string, cb: (...args: Rest<A>) => R | PromiseLike<R>, data: A[] | Record<string, A>) {
            makeThrowsTheory(describe.only, name, cb, data);
        }
    }
}


export type ErrorConstructorLike = ErrorConstructor | TypeErrorConstructor | RangeErrorConstructor;

export function preconditions(name: string, data: [any, ErrorConstructorLike][], cb: (value: any) => void) {
    const stack = getStack();
    theory(`preconditions for ${name}`, data, (value, error) => {
        try {
            if (error) {
                expect(() => cb(value)).to.throw(error)
            }
            else {
                expect(() => cb(value)).to.not.throw();
            }
        }
        catch (e) {
            if (stack) e.stack = stack;
            throw e;
        }
    });
}
