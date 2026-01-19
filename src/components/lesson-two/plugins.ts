import {
	BufferFrequencyHint,
	BufferUsage,
	Format,
	TextureUsage,
	TransparentWhite,
	WebGLDeviceContribution,
	WebGPUDeviceContribution,
} from "@antv/g-device-api";
import type {
	Device,
	DeviceContribution,
	RenderPass,
	RenderTarget,
	SwapChain,
} from "@antv/g-device-api";

import type { InfiniteCanvasConfig } from "@/components/lesson-two";
import type { Shape } from "@/components/lesson-two/shapes";
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
	render: SyncHook<Array<Shape>>;
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
	#renderPass: RenderPass;
	// @ts-ignore Ignore
	#renderTarget: RenderTarget;
	// @ts-ignore Ignore
	#swapChain: SwapChain;
	// @ts-ignore Ignore
	#uniformBuffer: Buffer;

	apply(context: PluginContext) {
		const { canvas, devicePixelRatio, hooks, renderer, shaderCompilerPath } = context;

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

			this.#renderTarget = this.#device.createRenderTargetFromTexture(
				this.#device.createTexture({
					format: Format.U8_RGBA_RT,
					height,
					usage: TextureUsage.RENDER_TARGET,
					width,
				}),
			);

			this.#uniformBuffer = this.#device.createBuffer({
				viewOrSize: new Float32Array([
					width / (devicePixelRatio ?? 1),
					height / (devicePixelRatio ?? 1),
				]),
				usage: BufferUsage.UNIFORM,
				hint: BufferFrequencyHint.DYNAMIC,
			});
		});

		hooks.resize.tap((width, height) => {
			this.#swapChain.configureSwapChain(
				width * (devicePixelRatio ?? 1.0),
				height * (devicePixelRatio ?? 1.0),
			);
		});

		hooks.destroy.tap(() => {
			this.#renderTarget.destroy();
			this.#uniformBuffer.destroy();
			this.#device.destroy();
			this.#device.checkForLeaks();
		});

		hooks.beginFrame.tap(() => {
			const { width, height } = this.#swapChain.getCanvas();
			const onscreentexture = this.#swapChain.getOnscreenTexture();

			this.#uniformBuffer.setSubData(
				0,
				new Uint8Array(
					new Float32Array([width / (devicePixelRatio ?? 1), height / (devicePixelRatio ?? 1)])
						.buffer,
				),
			);

			this.#device.beginFrame();

			this.#renderPass = this.#device.createRenderPass({
				colorAttachment: [this.#renderTarget],
				colorClearColor: [TransparentWhite],
				colorResolveTo: [onscreentexture],
			});

			this.#renderPass.setViewport(0, 0, width, height);
		});

		hooks.render.tap((shape) => {
			shape.render(this.#device, this.#renderPass, this.#uniformBuffer);
		});

		hooks.endFrame.tap(() => {
			this.#device.submitPass(this.#renderPass);
			this.#device.endFrame();
		});
	}
}
