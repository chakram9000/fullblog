import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main>
			<h1>Welcome to the blog!</h1>
		</main>
	);
}
