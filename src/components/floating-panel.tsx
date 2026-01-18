import { splitProps } from "solid-js";

import { FloatingPanel } from "@ark-ui/solid/floating-panel";
import type {
	FloatingPanelBodyProps,
	FloatingPanelContentProps,
	FloatingPanelHeaderProps,
	FloatingPanelRootProps,
} from "@ark-ui/solid/floating-panel";

import { cn } from "@/lib/cn";

export function FloatingPanelRoot(props: FloatingPanelRootProps) {
	return <FloatingPanel.Root {...props} />;
}

export function FloatingPanelContent(props: FloatingPanelContentProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<FloatingPanel.Positioner class="fixed">
			<FloatingPanel.Content
				{...other}
				class={cn(
					"bg-striped border-foreground/70 z-50 flex h-full w-full flex-col border px-2 pb-2",

					split.class,
				)}
			/>
		</FloatingPanel.Positioner>
	);
}

export function FloatingPanelHeader(props: FloatingPanelHeaderProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<FloatingPanel.DragTrigger class="h-6">
			<FloatingPanel.Header
				{...other}
				class={cn(
					"flex h-full w-full items-center justify-between",

					split.class,
				)}
			/>
		</FloatingPanel.DragTrigger>
	);
}

export function FloatingPanelBody(props: FloatingPanelBodyProps) {
	const [split, other] = splitProps(props, ["class"]);

	return (
		<FloatingPanel.Body
			{...other}
			class={cn(
				"bg-background h-full w-full rounded-lg border p-2",

				split.class,
			)}
		/>
	);
}
