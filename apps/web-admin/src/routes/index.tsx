import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: () => {
		const jwt = localStorage.getItem("jwt");

		if (!jwt) {
			throw redirect({
				to: "/login",
			});
		}

		throw redirect({
			to: "/posts",
		});
	},
});
