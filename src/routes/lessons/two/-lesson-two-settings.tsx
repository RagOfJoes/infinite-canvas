import { Index } from "solid-js/web";

import { GripIcon } from "lucide-solid";

import {
	FloatingPanelBody,
	FloatingPanelContent,
	FloatingPanelHeader,
	FloatingPanelRoot,
} from "@/components/floating-panel";
import { AntiAliasingType, Circle } from "@/components/lesson-two";
import type { InfiniteCanvasConfig } from "@/components/lesson-two";
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
import { cn } from "@/lib/cn";
import { useLessonTwoContext } from "@/routes/lessons/two/-lesson-two-context";

export function LessonTwoSettings() {
	const [state, actions] = useLessonTwoContext();

	const antiAliasingTypeToString = () => {
		switch (state.circleOptions().antiAliasingType) {
			case AntiAliasingType.SMOOTHSTEP:
				return "Smoothstep";
			case AntiAliasingType.DIVIDE:
				return "Divide";
			case AntiAliasingType.FWIDTH:
				return "F Width";
			default:
				return "None";
		}
	};

	return (
		<FloatingPanelRoot
			defaultPosition={{
				x: 8,
				y: 8,
			}}
			defaultSize={{ width: 280, height: 400 }}
			minSize={{ width: 280, height: 320 }}
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
						collection={state.collections.rendererTypes}
						multiple={false}
						onValueChange={(details) => {
							actions.updateRenderer(
								details.value[0] as Exclude<InfiniteCanvasConfig["renderer"], undefined>,
							);
							actions.updateShapes([]);
						}}
						value={[state.renderer()]}
					>
						<SelectLabel>Renderer</SelectLabel>

						<SelectControl placeholder="Select a renderer" />

						<SelectContent>
							<SelectItemGroup>
								<Index each={state.collections.rendererTypes.items}>
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
						max={800}
						min={100}
						onValueChange={(details) => {
							actions.updateSize({
								...state.size(),
								width: details.value[0],
							});
						}}
						value={[state.size().width]}
					>
						<div class="flex w-full justify-between">
							<SliderLabel>Canvas Width</SliderLabel>
							<SliderValueText />
						</div>

						<SliderControl>
							<SliderThumb index={0} />
						</SliderControl>
					</SliderRoot>

					<SliderRoot
						max={800}
						min={100}
						onValueChange={(details) => {
							actions.updateSize({
								...state.size(),
								height: details.value[0],
							});
						}}
						value={[state.size().height]}
					>
						<div class="flex w-full justify-between">
							<SliderLabel>Canvas Height</SliderLabel>
							<SliderValueText />
						</div>

						<SliderControl>
							<SliderThumb index={0} />
						</SliderControl>
					</SliderRoot>

					<div class="bg-muted h-px w-full" />

					<button
						class={cn(
							"bg-background cursor-pointer border px-3 py-2 font-mono text-xs font-semibold uppercase transition-colors",

							"disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
							"focus:ring-primary focus:border-primary focus:ring-1 focus:outline-none",
							"hover:bg-muted",
						)}
						disabled={state.shapes().length > 0}
						onClick={() => {
							if (state.shapes().length > 0) {
								return;
							}

							const circle = new Circle({
								...state.circleOptions(),
							});
							actions.updateShapes([circle]);
						}}
					>
						Add Circle
					</button>

					<SelectRoot
						collection={state.collections.antiAliasingTypes}
						multiple={false}
						onValueChange={(details) => {
							let newValue: AntiAliasingType;
							switch (details.value[0]) {
								case "Smoothstep":
									newValue = AntiAliasingType.SMOOTHSTEP;
									break;
								case "Divide":
									newValue = AntiAliasingType.DIVIDE;
									break;
								case "F Width":
									newValue = AntiAliasingType.FWIDTH;
									break;
								default:
									newValue = AntiAliasingType.NONE;
							}

							actions.updateCircleOptions({
								...state.circleOptions(),
								antiAliasingType: newValue,
							});
							actions.updateShapes([
								new Circle({
									...state.circleOptions(),
									antiAliasingType: newValue,
								}),
							]);
						}}
						value={[antiAliasingTypeToString()]}
					>
						<SelectLabel>Anti-Aliasing Type</SelectLabel>

						<SelectControl placeholder="Select an anti-aliasing type" />

						<SelectContent>
							<SelectItemGroup>
								<Index each={state.collections.antiAliasingTypes.items}>
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
				</FloatingPanelBody>
			</FloatingPanelContent>
		</FloatingPanelRoot>
	);
}
