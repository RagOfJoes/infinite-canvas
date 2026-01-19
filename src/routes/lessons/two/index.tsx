import { Show } from "solid-js/web";

import { ClientOnly, createFileRoute } from "@tanstack/solid-router";

import { LessonTwoProvider, useLessonTwo } from "@/routes/lessons/two/-lesson-two-context";
import { LessonTwoInfiniteCanvas } from "@/routes/lessons/two/-lesson-two-infinite-canvas";
import { LessonTwoSettings } from "@/routes/lessons/two/-lesson-two-settings";

export const Route = createFileRoute("/lessons/two/")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: "Lesson Two | Infinite Canvas",
			},
		],
	}),
});

function RouteComponent() {
	const value = useLessonTwo();

	return (
		<ClientOnly>
			<LessonTwoProvider value={value}>
				<div class="flex min-h-screen flex-col items-center justify-center gap-2">
					<LessonTwoSettings />

					<Show when={value[0].renderer() === "webgl"}>
						<LessonTwoInfiniteCanvas renderer="webgl" />
					</Show>
					<Show when={value[0].renderer() === "webgpu"}>
						<LessonTwoInfiniteCanvas renderer="webgpu" />
					</Show>
				</div>
			</LessonTwoProvider>
		</ClientOnly>
	);
}
