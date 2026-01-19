import {
	BlendFactor,
	BlendMode,
	BufferFrequencyHint,
	BufferUsage,
	ChannelWriteMask,
	Format,
	VertexStepMode,
} from "@antv/g-device-api";
import * as d3 from "d3-color";
import type {
	Bindings,
	Buffer,
	Device,
	InputLayout,
	Program,
	RenderPass,
	RenderPipeline,
} from "@antv/g-device-api";

import { frag, vert } from "@/components/lesson-two/shaders";

export enum AntiAliasingType {
	NONE,
	SMOOTHSTEP,
	DIVIDE,
	FWIDTH,
}

export abstract class Shape {
	/**
	 * Avoid unnecessary work like updating Buffer by deferring it until needed.
	 * @see https://gameprogrammingpatterns.com/dirty-flag.html
	 */
	protected renderDirtyFlag = true;

	abstract render(device: Device, renderPass: RenderPass, uniformBuffer: Buffer): void;
	abstract destroy(): void;
}

export class Circle extends Shape {
	// Anti-Aliasing Type
	#antiAliasingType: AntiAliasingType;
	// Center's X Position
	// @ts-ignore Initialized using setter
	#cx: number;
	// Center's Y Position
	// @ts-ignore Initialized using setter
	#cy: number;
	// Fill Color
	// @ts-ignore Initialized using setter
	#fill: string;
	// @ts-ignore Initialized using setter
	#fillRGB: d3.RGBColor;
	// Radius
	// @ts-ignore Initialized using setter
	#r: number;

	#bindings?: Bindings;
	#fragUnitBuffer?: Buffer;
	#indexBuffer?: Buffer;
	#inputLayout?: InputLayout;
	#instancedBuffer?: Buffer;
	#pipeline?: RenderPipeline;
	#program?: Program;
	#uniformBuffer?: Buffer;

	constructor(
		config: Partial<{
			antiAliasingType: AntiAliasingType;
			cx: number;
			cy: number;
			fill: string;
			r: number;
		}> = {},
	) {
		super();

		this.#antiAliasingType = config.antiAliasingType ?? AntiAliasingType.NONE;
		this.cx = config.cx ?? 0;
		this.cy = config.cy ?? 0;
		this.fill = config.fill ?? "black";
		this.r = config.r ?? 0;
	}

	/**
	 * Lifecyle
	 */

	render(device: Device, renderPass: RenderPass, uniformBuffer: Buffer) {
		if (!this.#program) {
			this.#uniformBuffer = device.createBuffer({
				hint: BufferFrequencyHint.DYNAMIC,
				usage: BufferUsage.UNIFORM,
				viewOrSize: new Float32Array([this.#antiAliasingType]),
			});
			this.#program = device.createProgram({
				fragment: {
					glsl: frag,
				},
				vertex: {
					glsl: vert,
				},
			});

			this.#instancedBuffer = device.createBuffer({
				viewOrSize: Float32Array.BYTES_PER_ELEMENT * 8,
				usage: BufferUsage.VERTEX,
				hint: BufferFrequencyHint.DYNAMIC,
			});
			this.#fragUnitBuffer = device.createBuffer({
				viewOrSize: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
				usage: BufferUsage.VERTEX,
				hint: BufferFrequencyHint.STATIC,
			});
			this.#indexBuffer = device.createBuffer({
				viewOrSize: new Uint32Array([0, 1, 2, 0, 2, 3]),
				usage: BufferUsage.INDEX,
				hint: BufferFrequencyHint.STATIC,
			});

			this.#inputLayout = device.createInputLayout({
				vertexBufferDescriptors: [
					{
						arrayStride: 4 * 2,
						stepMode: VertexStepMode.VERTEX,
						attributes: [
							{
								shaderLocation: 0,
								offset: 0,
								format: Format.F32_RG,
							},
						],
					},
					{
						arrayStride: 4 * 8,
						stepMode: VertexStepMode.INSTANCE,
						attributes: [
							{
								shaderLocation: 1,
								offset: 0,
								format: Format.F32_RG,
							},
							{
								shaderLocation: 2,
								offset: 4 * 2,
								format: Format.F32_RG,
							},
							{
								shaderLocation: 3,
								offset: 4 * 4,
								format: Format.F32_RGBA,
							},
						],
					},
				],
				indexBufferFormat: Format.U32_R,
				program: this.#program,
			});

			this.#pipeline = device.createRenderPipeline({
				inputLayout: this.#inputLayout,
				program: this.#program,
				colorAttachmentFormats: [Format.U8_RGBA_RT],
				megaStateDescriptor: {
					attachmentsState: [
						{
							channelWriteMask: ChannelWriteMask.ALL,
							rgbBlendState: {
								blendMode: BlendMode.ADD,
								blendSrcFactor: BlendFactor.SRC_ALPHA,
								blendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
							},
							alphaBlendState: {
								blendMode: BlendMode.ADD,
								blendSrcFactor: BlendFactor.ONE,
								blendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
							},
						},
					],
				},
			});

			this.#bindings = device.createBindings({
				pipeline: this.#pipeline,
				uniformBufferBindings: [
					{
						buffer: uniformBuffer,
					},
					{
						buffer: this.#uniformBuffer,
					},
				],
			});
		}

		if (this.#instancedBuffer && this.renderDirtyFlag) {
			this.#instancedBuffer.setSubData(
				0,
				new Uint8Array(
					new Float32Array([
						this.#cx,
						this.#cy,
						this.#r,
						this.#r,
						this.#fillRGB.r / 255,
						this.#fillRGB.g / 255,
						this.#fillRGB.b / 255,
						this.#fillRGB.opacity,
					]).buffer,
				),
			);
		}

		if (this.#pipeline) {
			renderPass.setPipeline(this.#pipeline);
		}
		if (this.#fragUnitBuffer && this.#indexBuffer && this.#inputLayout && this.#instancedBuffer) {
			renderPass.setVertexInput(
				this.#inputLayout,
				[
					{
						buffer: this.#fragUnitBuffer,
					},
					{
						buffer: this.#instancedBuffer,
					},
				],
				{
					buffer: this.#indexBuffer,
				},
			);
		}
		if (this.#bindings) {
			renderPass.setBindings(this.#bindings);
		}
		renderPass.drawIndexed(6, 1);

		this.renderDirtyFlag = false;
	}

	destroy(): void {
		this.#program?.destroy();
		this.#instancedBuffer?.destroy();
		this.#fragUnitBuffer?.destroy();
		this.#indexBuffer?.destroy();
		this.#uniformBuffer?.destroy();
		this.#pipeline?.destroy();
		this.#inputLayout?.destroy();
		this.#bindings?.destroy();
	}

	/**
	 * Getters & Setters
	 */

	get cx(): number {
		return this.#cx;
	}

	set cx(cx: number) {
		if (this.#cx === cx) {
			return;
		}

		this.#cx = cx;
		this.renderDirtyFlag = true;
	}

	get cy(): number {
		return this.cy;
	}

	set cy(cy: number) {
		if (this.#cy === cy) {
			return;
		}

		this.#cy = cy;
		this.renderDirtyFlag = true;
	}

	get fill(): string {
		return this.#fill;
	}

	set fill(fill: string) {
		if (this.#fill === fill) {
			return;
		}

		this.#fill = fill;
		this.#fillRGB = d3.rgb(fill);
		this.renderDirtyFlag = true;
	}

	get r(): number {
		return this.#r;
	}

	set r(r: number) {
		if (this.#r === r) {
			return;
		}

		this.#r = r;
		this.renderDirtyFlag = true;
	}
}
