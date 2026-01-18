import { splitProps } from "solid-js";

import { Slider } from "@ark-ui/solid/slider";
import type {
	SliderControlProps,
	SliderLabelProps,
	SliderRangeProps,
	SliderRootProps,
	SliderThumbProps,
	SliderTrackProps,
	SliderValueTextProps,
} from "@ark-ui/solid/slider";

import { cn } from "@/lib/cn";

export function SliderRoot(props: SliderRootProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Slider.Root
			{...other}
			class={cn(
				"grid gap-2",

				split.class,
			)}
		/>
	);
}

export function SliderLabel(props: SliderLabelProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Slider.Label
			{...other}
			class={cn(
				"text-foreground font-mono text-xs font-light",

				split.class,
			)}
		/>
	);
}

export function SliderValueText(props: SliderValueTextProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Slider.ValueText
			{...other}
			class={cn(
				"text-foreground font-mono text-xs font-light",

				split.class,
			)}
		/>
	);
}

export function SliderControl(props: SliderControlProps) {
	const [split, other] = splitProps(props, ["children", "class"]);

	return (
		<Slider.Control
			{...other}
			class={cn(
				"relative flex h-2 items-center",

				split.class,
			)}
		>
			<SliderTrack>
				<SliderRange />
			</SliderTrack>

			{split.children}
		</Slider.Control>
	);
}

export function SliderTrack(props: SliderTrackProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Slider.Track
			{...other}
			class={cn(
				"bg-muted relative h-1 flex-1 overflow-hidden rounded-full",

				split.class,
			)}
		/>
	);
}

export function SliderRange(props: SliderRangeProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Slider.Range
			{...other}
			class={cn(
				"bg-primary absolute h-full rounded-full",

				split.class,
			)}
		/>
	);
}
export function SliderThumb(props: SliderThumbProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Slider.Thumb
			{...other}
			class={cn(
				"bg-background border-foreground relative z-10 size-4 cursor-pointer rounded-full border-2 shadow-sm outline-none",

				"focus:ring-primary focus:ring-offset-background focus:ring-2 focus:ring-offset-2",

				split.class,
			)}
		>
			<Slider.HiddenInput />
		</Slider.Thumb>
	);
}
