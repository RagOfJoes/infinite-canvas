import { createMemo, createSignal } from "solid-js";
import { createListCollection } from "@ark-ui/solid/select";
import type { Accessor } from "solid-js";

import type { ListCollection } from "@ark-ui/solid/select";

import type { InfiniteCanvasConfig, Shape } from "@/components/lesson-two";
import { AntiAliasingType } from "@/components/lesson-two";
import { createContext } from "@/lib/create-context";

export type UseLessonTwo = [
	state: {
		collections: {
			antiAliasingTypes: ListCollection<string>;
			rendererTypes: ListCollection<Exclude<InfiniteCanvasConfig["renderer"], undefined>>;
		};

		circleOptions: Accessor<{
			antiAliasingType: AntiAliasingType;
			cx: number;
			cy: number;
			r: number;
		}>;
		renderer: Accessor<Exclude<InfiniteCanvasConfig["renderer"], undefined>>;
		shapes: Accessor<Array<Shape>>;
		size: Accessor<{
			width: number;
			height: number;
		}>;
	},
	actions: {
		updateCircleOptions: (circleOptions: ReturnType<UseLessonTwo[0]["circleOptions"]>) => void;
		updateRenderer: (renderer: ReturnType<UseLessonTwo[0]["renderer"]>) => void;
		updateShapes: (shapes: ReturnType<UseLessonTwo[0]["shapes"]>) => void;
		updateSize: (size: ReturnType<UseLessonTwo[0]["size"]>) => void;
	},
];

export const [LessonTwoProvider, useLessonTwoContext] = createContext<UseLessonTwo>({
	hookName: "useLessonTwoContext",
	name: "LessonTwoContext",
	providerName: "LessonTwoProvider",
	strict: true,
});

export function useLessonTwo(): UseLessonTwo {
	const antiAliasingTypeCollection: UseLessonTwo[0]["collections"]["antiAliasingTypes"] =
		createListCollection({
			items: ["None", "Smoothstep", "Divide", "F Width"],
		});
	const rendererCollection: UseLessonTwo[0]["collections"]["rendererTypes"] = createListCollection({
		items: ["webgl", "webgpu"],
	});

	const [circleOptions, setCircleOptions] = createSignal<
		ReturnType<UseLessonTwo[0]["circleOptions"]>
	>({
		antiAliasingType: AntiAliasingType.NONE,
		cx: 50,
		cy: 50,
		r: 50,
	});
	const [renderer, setRenderer] = createSignal<ReturnType<UseLessonTwo[0]["renderer"]>>("webgl");
	const [shapes, setShapes] = createSignal<ReturnType<UseLessonTwo[0]["shapes"]>>([]);
	const [size, setSize] = createSignal<ReturnType<UseLessonTwo[0]["size"]>>({
		width: 500,
		height: 500,
	});

	const updateCircleOptions: UseLessonTwo[1]["updateCircleOptions"] = (newValue) => {
		setCircleOptions(newValue);
	};
	const updateRenderer: UseLessonTwo[1]["updateRenderer"] = (newValue) => {
		setRenderer(newValue);
	};
	const updateShapes: UseLessonTwo[1]["updateShapes"] = (newValue) => {
		setShapes(newValue);
	};
	const updateSize: UseLessonTwo[1]["updateSize"] = (newValue) => {
		setSize(newValue);
	};

	const value = createMemo<UseLessonTwo>(() => [
		{
			circleOptions,
			collections: {
				antiAliasingTypes: antiAliasingTypeCollection,
				rendererTypes: rendererCollection,
			},
			renderer,
			shapes,
			size,
		},
		{
			updateCircleOptions,
			updateRenderer,
			updateShapes,
			updateSize,
		},
	]);

	return value();
}
