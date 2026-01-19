import { WebGLDeviceContribution, WebGPUDeviceContribution } from "@antv/g-device-api";
import type { DeviceContribution } from "@antv/g-device-api";

import type { InfiniteCanvasConfig } from "@/components/lesson-one/lesson-one-infinite-canvas";
import type { AsyncParallelHook, SyncHook } from "@/lib/hooks";

export interface Hooks {
	/**
	 * Called at the initialization stage.
	 */
	init: SyncHook<[]>;
	/**
	 * Called at the initialization stage.
	 */
	initAsync: AsyncParallelHook<[]>;
	/**
	 * Called at the beginning of each frame.
	 */
	beginFrame: SyncHook<[]>;
	/**
	 * Called at the end of each frame.
	 */
	endFrame: SyncHook<[]>;
	/**
	 * Called at the destruction stage.
	 */
	destroy: SyncHook<[]>;
	/**
	 * Called when the canvas is resized.
	 */
	resize: SyncHook<[number, number]>;
}

export type PluginContext = {
	/**
	 * Contains the global this value.
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
	 */
	globalThis: typeof globalThis;
	hooks: Hooks;
} & InfiniteCanvasConfig;

/**
 * Inspired by Webpack plugin system.
 */
export interface Plugin {
	/**
	 * Get called when the plugin is installed.
	 */
	apply: (context: PluginContext) => void;
}

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
