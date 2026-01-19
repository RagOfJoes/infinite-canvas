import { createEffect, onCleanup, onMount } from "solid-js";

import { InfiniteCanvas } from "@/components/lesson-two";
import type { UseLessonTwo } from "@/routes/lessons/two/-lesson-two-context";
import { useLessonTwoContext } from "@/routes/lessons/two/-lesson-two-context";

export type LessonTwoInfiniteCanvasProps = {
	renderer: ReturnType<UseLessonTwo[0]["renderer"]>;
};

export function LessonTwoInfiniteCanvas(props: LessonTwoInfiniteCanvasProps) {
	const [state] = useLessonTwoContext();

	let canvas: InfiniteCanvas | undefined;
	let canvasRef!: HTMLCanvasElement;

	const resize = (width: number, height: number) => {
		canvasRef.width = width;
		canvasRef.height = height;

		canvasRef.style.width = `${width}px`;
		canvasRef.style.height = `${height}px`;
		canvasRef.style.outline = "none";
		canvasRef.style.padding = "0px";
		canvasRef.style.margin = "0px";
	};

	createEffect(() => {
		resize(state.size().width, state.size().height);
	});

	createEffect(() => {
		state.shapes().forEach((shape) => {
			canvas?.appendChild(shape);
		});
	});

	onMount(async () => {
		resize(state.size().width, state.size().height);

		canvas = await new InfiniteCanvas({
			canvas: canvasRef,
			renderer: props.renderer,
			shaderCompilerPath: "/glsl_wgsl_compiler_bg.wasm",
		}).initialized;

		const animate = () => {
			canvas!.render();
			requestAnimationFrame(animate);
		};
		animate();
	});

	onCleanup(() => {
		canvas?.destroy();
	});

	return <canvas class="border" ref={canvasRef} />;
}
