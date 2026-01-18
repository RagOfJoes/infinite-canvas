import type { AsArray } from "@/types/as-array";

export class AsyncParallelHook<T> {
	#callbacks: Array<(...args: Array<T>) => Promise<void>> = [];

	getCallbacksNum() {
		return this.#callbacks.length;
	}

	tapPromise(fn: (...args: Array<T>) => Promise<void>) {
		this.#callbacks.push(fn);
	}

	promise(...args: Array<T>): Promise<Array<void>> {
		return Promise.all(
			this.#callbacks.map((callback) => {
				return callback(...args);
			}),
		);
	}
}

export class AsyncSeriesWaterfallHook<T, U> {
	#callbacks: Array<(...args: AsArray<T>) => Promise<U>> = [];

	tapPromise(fn: (...args: AsArray<T>) => Promise<U>) {
		this.#callbacks.push(fn);
	}

	async promise(...args: AsArray<T>): Promise<U | null> {
		if (this.#callbacks.length) {
			let result: U = await this.#callbacks[0](...args);
			for (let i = 0; i < this.#callbacks.length - 1; i++) {
				const callback = this.#callbacks[i];

				// @ts-ignore Ignore
				result = await callback(result);
			}

			return result;
		}

		return null;
	}
}

export class SyncHook<T> {
	#callbacks: Array<(...args: AsArray<T>) => void> = [];

	tap(fn: (...args: AsArray<T>) => void) {
		this.#callbacks.push(fn);
	}

	call(...argsArr: AsArray<T>): void {
		this.#callbacks.forEach(function (callback) {
			callback.apply(void 0, argsArr);
		});
	}
}

export class SyncWaterfallHook<T> {
	#callbacks: Array<(...args: AsArray<T>) => T> = [];

	tap(fn: (...args: AsArray<T>) => T) {
		this.#callbacks.push(fn);
	}

	call(...argsArr: AsArray<T>): AsArray<T> | null {
		if (this.#callbacks.length) {
			let result = this.#callbacks[0].apply(void 0, argsArr);
			for (let i = 0; i < this.#callbacks.length - 1; i++) {
				const callback = this.#callbacks[i];
				result = callback(...(result as AsArray<T>));
			}

			// @ts-ignore Ignore
			return result;
		}

		return null;
	}
}
