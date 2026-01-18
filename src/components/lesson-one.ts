import { WebGLDeviceContribution, WebGPUDeviceContribution } from "@antv/g-device-api";
import type { Device, DeviceContribution, SwapChain } from "@antv/g-device-api";

import type { Plugin, PluginContext } from "@/lib/plugins";
import { getGlobalThis } from "@/lib/browser";
import { AsyncParallelHook, SyncHook } from "@/lib/hooks";

export class Renderer implements Plugin {
	// @ts-ignore Ignore
	#device: Device;
	// @ts-ignore Ignore
	#swapChain: SwapChain;

	apply(context: PluginContext) {
		const { hooks, canvas, renderer, shaderCompilerPath, devicePixelRatio } = context;

		hooks.initAsync.tapPromise(async () => {
			let deviceContribution: DeviceContribution;
			if (renderer === "webgl") {
				deviceContribution = new WebGLDeviceContribution({
					targets: ["webgl2", "webgl1"],
					antialias: true,
					shaderDebug: true,
					trackResources: true,
					onContextCreationError: () => {},
					onContextLost: () => {},
					onContextRestored() {},
				});
			} else {
				deviceContribution = new WebGPUDeviceContribution({
					shaderCompilerPath,
					onContextLost: () => {},
				});
			}

			const { width, height } = canvas;
			const swapChain = await deviceContribution.createSwapChain(canvas);
			swapChain.configureSwapChain(width, height);

			this.#swapChain = swapChain;
			this.#device = swapChain.getDevice();
		});

		hooks.resize.tap((width, height) => {
			this.#swapChain.configureSwapChain(
				width * (devicePixelRatio ?? 1.0),
				height * (devicePixelRatio ?? 1.0),
			);
		});

		hooks.destroy.tap(() => {
			this.#device.destroy();
		});

		hooks.beginFrame.tap(() => {
			this.#device.beginFrame();
		});

		hooks.endFrame.tap(() => {
			this.#device.endFrame();
		});
	}
}

export interface CanvasConfig {
	canvas: HTMLCanvasElement;
	renderer?: "webgl" | "webgpu";
	shaderCompilerPath?: string;
	devicePixelRatio?: number;
}

export class Canvas {
	#instancePromise: Promise<this>;
	#pluginContext: PluginContext;

	constructor(config: CanvasConfig) {
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
