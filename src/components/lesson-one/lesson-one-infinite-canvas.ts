import type { PluginContext } from "@/components/lesson-one/lesson-one-plugins";
import { getGlobalThis } from "@/lib/browser";
import { AsyncParallelHook, SyncHook } from "@/lib/hooks";

export interface InfiniteCanvasConfig {
	canvas: HTMLCanvasElement;
	renderer?: "webgl" | "webgpu";
	shaderCompilerPath?: string;
	devicePixelRatio?: number;
}

export class InfiniteCanvas {
	#instancePromise: Promise<this>;
	#pluginContext: PluginContext & InfiniteCanvasConfig;

	constructor(config: InfiniteCanvasConfig) {
		const { canvas, renderer = "webgl", shaderCompilerPath = "", devicePixelRatio } = config;

		const globalThis = getGlobalThis();

		this.#pluginContext = {
			globalThis,
			canvas,
			renderer,
			shaderCompilerPath,
			devicePixelRatio: devicePixelRatio ?? globalThis.devicePixelRatio,
			hooks: {
				init: new SyncHook<[]>(),
				initAsync: new AsyncParallelHook<[]>(),
				beginFrame: new SyncHook<[]>(),
				endFrame: new SyncHook<[]>(),
				destroy: new SyncHook<[]>(),
				resize: new SyncHook<[number, number]>(),
			},
		};

		// eslint-disable-next-line @typescript-eslint/require-await
		this.#instancePromise = (async () => {
			return this;
		})();
	}

	get initialized() {
		return this.#instancePromise.then(() => this);
	}

	/**
   * Render to the canvas, usually called in a render/animate loop.
   * @example
   * const animate = () => {
      canvas.render();
      requestAnimationFrame(animate);
    };
    animate();
   */
	render() {
		const { hooks } = this.#pluginContext;
		hooks.beginFrame.call();
		hooks.endFrame.call();
	}

	resize(width: number, height: number) {
		const { hooks } = this.#pluginContext;
		hooks.resize.call(width, height);
	}

	/**
	 * Destroy the canvas.
	 */
	destroy() {
		const { hooks } = this.#pluginContext;
		hooks.destroy.call();
	}

	getDOM() {
		return this.#pluginContext.canvas;
	}
}
