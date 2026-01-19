import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return <h1>Index</h1>;
}
