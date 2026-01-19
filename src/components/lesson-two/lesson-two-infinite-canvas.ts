import { Renderer } from "@/components/lesson-two/lesson-two-plugins";
import type { PluginContext } from "@/components/lesson-two/lesson-two-plugins";
import type { Shape } from "@/components/lesson-two/lesson-two-shapes";
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
	#shapes: Array<Shape> = [];

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
				render: new SyncHook<Array<Shape>>(),
				endFrame: new SyncHook<[]>(),
				destroy: new SyncHook<[]>(),
				resize: new SyncHook<[number, number]>(),
			},
		};

		this.#instancePromise = (async () => {
			// @ts-ignore Initialized above
			const { hooks } = this.#pluginContext;

			[new Renderer()].forEach((plugin) => {
				plugin.apply(this.#pluginContext);
			});
			hooks.init.call();
			await hooks.initAsync.promise();

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

		this.#shapes.forEach((shape) => {
			hooks.render.call(shape);
		});

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
		this.#shapes.forEach((shape) => shape.destroy());
		hooks.destroy.call();
	}

	getDOM() {
		return this.#pluginContext.canvas;
	}

	appendChild(shape: Shape) {
		this.#shapes.push(shape);
	}

	removeChild(shape: Shape) {
		const index = this.#shapes.indexOf(shape);
		if (index === -1) {
			return;
		}

		this.#shapes.splice(index, 1);
	}

	removeChildren() {
		this.#shapes.splice(0, this.#shapes.length - 1);
	}
}
