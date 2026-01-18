import { Index, createEffect, createSignal, onMount } from "solid-js";

import { createListCollection } from "@ark-ui/solid/select";
import { ClientOnly, createFileRoute } from "@tanstack/solid-router";
import { GripIcon } from "lucide-solid";

import type { CanvasConfig } from "@/components/lesson-one";
import {
	FloatingPanelBody,
	FloatingPanelContent,
	FloatingPanelHeader,
	FloatingPanelRoot,
} from "@/components/floating-panel";
import { Canvas as CanvasClass } from "@/components/lesson-one";
import {
	SelectContent,
	SelectControl,
	SelectItem,
	SelectItemGroup,
	SelectItemText,
	SelectLabel,
	SelectRoot,
} from "@/components/select";
import {
	SliderControl,
	SliderLabel,
	SliderRoot,
	SliderThumb,
	SliderValueText,
} from "@/components/slider";

export const Route = createFileRoute("/")({ component: App });

function Canvas(props: {
	renderer?: CanvasConfig["renderer"];
	size: {
		width: number;
		height: number;
	};
}) {
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
		resize(props.size.width, props.size.height);
	});

	onMount(async () => {
		resize(props.size.width, props.size.height);

		const canvas = await new CanvasClass({
			canvas: canvasRef,
			renderer: props.renderer,
		}).initialized;

		const animate = () => {
			canvas.render();
			requestAnimationFrame(animate);
		};
	});

	return <canvas class="border" ref={canvasRef}></canvas>;
}

function App() {
	const collection = createListCollection<Required<CanvasConfig["renderer"]>>({
		items: ["webgl", "webgpu"],
	});
	const [renderer, setRenderer] =
		createSignal<Exclude<CanvasConfig["renderer"], undefined>>("webgl");
	const [size, setSize] = createSignal({
		width: 100,
		height: 100,
	});

	return (
		<div class="flex min-h-screen flex-col items-center justify-center gap-2">
			<FloatingPanelRoot
				defaultPosition={{
					x: 8,
					y: 8,
				}}
				defaultSize={{ width: 280, height: 240 }}
				lazyMount
				open
			>
				<FloatingPanelContent>
					<FloatingPanelHeader>
						<div class="flex items-center gap-2">
							<GripIcon class="text-foreground size-3" />

							<h3 class="text-foreground font-mono text-xs leading-none">Settings</h3>
						</div>
					</FloatingPanelHeader>

					<FloatingPanelBody class="flex flex-col gap-4">
						<SelectRoot
							collection={collection}
							multiple={false}
							onValueChange={(details) => {
								setRenderer(details.value[0] as Exclude<CanvasConfig["renderer"], undefined>);
							}}
							value={[renderer()]}
						>
							<SelectLabel>Renderer</SelectLabel>

							<SelectControl placeholder="Select a renderer" />

							<SelectContent>
								<SelectItemGroup>
									<Index each={collection.items}>
										{(item) => {
											return (
												<SelectItem item={item()}>
													<SelectItemText>{item()}</SelectItemText>
												</SelectItem>
											);
										}}
									</Index>
								</SelectItemGroup>
							</SelectContent>
						</SelectRoot>

						<div class="bg-muted h-px w-full" />

						<SliderRoot
							class="w-full"
							max={300}
							min={100}
							onValueChange={(details) => {
								setSize((prev) => {
									return { ...prev, width: details.value[0] };
								});
							}}
							value={[size().width]}
						>
							<div class="flex w-full justify-between">
								<SliderLabel>Width</SliderLabel>
								<SliderValueText />
							</div>

							<SliderControl>
								<SliderThumb index={0} />
							</SliderControl>
						</SliderRoot>

						<SliderRoot
							max={300}
							min={100}
							onValueChange={(details) => {
								setSize((prev) => {
									return { ...prev, height: details.value[0] };
								});
							}}
							value={[size().height]}
						>
							<div class="flex w-full justify-between">
								<SliderLabel>Height</SliderLabel>
								<SliderValueText />
							</div>

							<SliderControl>
								<SliderThumb index={0} />
							</SliderControl>
						</SliderRoot>
					</FloatingPanelBody>
				</FloatingPanelContent>
			</FloatingPanelRoot>

			<ClientOnly fallback={<h1>Loading...</h1>}>
				<Canvas renderer={renderer()} size={size()} />
			</ClientOnly>
		</div>
	);
}
