import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { hc } from "hono/client";
import type { AppType } from "api/src/index";

const client = hc<AppType>(import.meta.env.VITE_ORIGIN_API!);
export type ClientType = typeof client;
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: { client },
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
