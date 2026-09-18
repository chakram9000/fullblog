import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { createHonoClient } from "@blog/shared";
import { useAuthStore } from "./stores";

if (!import.meta.env.VITE_ORIGIN_API) throw Error("API origin not specified");
export const client = createHonoClient(import.meta.env.VITE_ORIGIN_API);

// verify initial auth using auth store
await useAuthStore.getState().checkin();
if (!useAuthStore.getState().user) {
	localStorage.removeItem("jwt");
}

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
