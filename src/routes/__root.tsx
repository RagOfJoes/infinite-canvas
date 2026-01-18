import { Suspense } from "solid-js";
import { HydrationScript } from "solid-js/web";

import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";

import style from "../styles.css?url";
import { cn } from "@/lib/cn";


export const Route = createRootRouteWithContext()({
	head: () => ({
		links: [{ rel: "stylesheet", href: style }],
		meta: [
			{
				title: "Infinite Canvas",
			},
		],
	}),
	shellComponent: RootComponent,
});

function RootComponent() {
	return (
		<html>
			<head>
				<HydrationScript />
			</head>

			<body
				class={cn(
					"bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden overscroll-none font-sans font-normal",
				)}
			>
				<HeadContent />
				<Suspense>
					<Outlet />
					<TanStackRouterDevtools />
				</Suspense>
				<Scripts />
			</body>
		</html>
	);
}
