// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** Creates a Promise with the `reject` and `resolve` functions
 * placed as methods on the promise object itself. It allows you to do:
 *
 *     const p = deferred<number>();
 *     // ...
 *     p.resolve(42);
 */
export function deferred() {
    let methods;
    const promise = new Promise((resolve, reject) => {
        methods = { resolve, reject };
    });
    return Object.assign(promise, methods);
}
/** The MuxAsyncIterator class multiplexes multiple async iterators into a
 * single stream. It currently makes a few assumptions:
 * - The iterators do not throw.
 * - The final result (the value returned and not yielded from the iterator)
 *   does not matter; if there is any, it is discarded.
 */
export class MuxAsyncIterator {
    constructor() {
        this.iteratorCount = 0;
        this.yields = [];
        this.signal = deferred();
    }
    add(iterator) {
        ++this.iteratorCount;
        this.callIteratorNext(iterator);
    }
    async callIteratorNext(iterator) {
        const { value, done } = await iterator.next();
        if (done) {
            --this.iteratorCount;
        }
        else {
            this.yields.push({ iterator, value });
        }
        this.signal.resolve();
    }
    async *iterate() {
        while (this.iteratorCount > 0) {
            // Sleep until any of the wrapped iterators yields.
            await this.signal;
            // Note that while we're looping over `yields`, new items may be added.
            for (let i = 0; i < this.yields.length; i++) {
                const { iterator, value } = this.yields[i];
                yield value;
                this.callIteratorNext(iterator);
            }
            // Clear the `yields` list and reset the `signal` promise.
            this.yields.length = 0;
            this.signal = deferred();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
/** Collects all Uint8Arrays from an AsyncIterable and retuns a single
 * Uint8Array with the concatenated contents of all the collected arrays.
 */
export async function collectUint8Arrays(it) {
    const chunks = [];
    let length = 0;
    for await (const chunk of it) {
        chunks.push(chunk);
        length += chunk.length;
    }
    if (chunks.length === 1) {
        // No need to copy.
        return chunks[0];
    }
    const collected = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
        collected.set(chunk, offset);
        offset += chunk.length;
    }
    return collected;
}
// Delays the given milliseconds and resolves.
export function delay(ms) {
    return new Promise((res) => setTimeout(() => {
        res();
    }, ms));
}
//# sourceMappingURL=async.js.map