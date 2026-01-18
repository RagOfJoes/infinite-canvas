import { splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { Select } from "@ark-ui/solid/select";
import { CheckIcon, ChevronDownIcon } from "lucide-solid";
import type {
	SelectContentProps,
	SelectControlProps,
	SelectItemGroupLabelProps,
	SelectItemGroupProps,
	SelectItemProps,
	SelectItemTextProps,
	SelectLabelProps,
	SelectRootProps,
	SelectTriggerProps,
} from "@ark-ui/solid/select";

import { cn } from "@/lib/cn";

export function SelectRoot<T extends unknown>(props: SelectRootProps<T>) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Select.Root
			{...other}
			class={cn(
				"grid gap-2",

				split.class,
			)}
		/>
	);
}

export function SelectLabel(props: SelectLabelProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Select.Label
			{...other}
			class={cn(
				"text-foreground font-mono text-xs font-light",

				split.class,
			)}
		/>
	);
}

export function SelectControl(
	props: SelectControlProps & {
		placeholder: string;
	},
) {
	const [split, other] = splitProps(props, ["class", "placeholder"]);

	return (
		<Select.Control
			{...other}
			class={cn(
				"",

				split.class,
			)}
		>
			<SelectTrigger placeholder={split.placeholder} />
		</Select.Control>
	);
}

export function SelectTrigger(
	props: SelectTriggerProps & {
		placeholder: string;
	},
) {
	const [split, other] = splitProps(props, ["children", "class", "placeholder"]);

	return (
		<Select.Trigger
			{...other}
			class={cn(
				"flex h-10 w-full items-center justify-between border px-3 py-2 text-xs transition-colors",

				"focus:ring-primary focus:border-primary focus:ring-1 focus:outline-none",

				split.class,
			)}
		>
			<Select.ValueText class="text-xs" placeholder={split.placeholder} />

			<Select.Indicator>
				<ChevronDownIcon class="text-muted-foreground size-4" />
			</Select.Indicator>
		</Select.Trigger>
	);
}

export function SelectContent(props: SelectContentProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Portal>
			<Select.Positioner>
				<Select.Content
					{...other}
					class={cn(
						"bg-background z-50 min-w-(--reference-width) border",

						split.class,
					)}
				/>
			</Select.Positioner>
		</Portal>
	);
}

export function SelectItemGroup(props: SelectItemGroupProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Select.ItemGroup
			{...other}
			class={cn(
				"",

				split.class,
			)}
		/>
	);
}

export function SelectItemGroupLabel(props: SelectItemGroupLabelProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Select.ItemGroupLabel
			{...other}
			class={cn(
				"font-mono text-xs",

				split.class,
			)}
		/>
	);
}

export function SelectItem(props: SelectItemProps) {
	const [split, other] = splitProps(props, ["children", "class"]);

	return (
		<Select.Item
			{...other}
			class={cn(
				"text-foreground relative flex cursor-pointer items-center justify-between px-3 py-2 transition-colors select-none",

				"data-highlighted:bg-muted data-highlighted:text-muted-foreground",

				split.class,
			)}
		>
			{split.children}

			<Select.ItemIndicator>
				<CheckIcon class="text-foreground size-3" />
			</Select.ItemIndicator>
		</Select.Item>
	);
}

export function SelectItemText(props: SelectItemTextProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<Select.ItemText
			{...other}
			class={cn(
				"text-foreground text-xs",

				split.class,
			)}
		/>
	);
}
