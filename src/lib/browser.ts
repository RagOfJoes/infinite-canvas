export const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";

export const getGlobalThis = (): typeof globalThis => {
	if (typeof globalThis !== "undefined") {
		return globalThis;
	}
	if (typeof self !== "undefined") {
		return self;
	}
	if (typeof window !== "undefined") {
		return window;
	}
	// @ts-ignore Ignore
	if (typeof global !== "undefined") {
		// @ts-ignore Ignore
		return global;
	}

	// @ts-ignore Ignore
	return {};
	// [!] Error: The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten
	// @see https://rollupjs.org/troubleshooting/#error-this-is-undefined
	// if (typeof this !== 'undefined') return this;
};
