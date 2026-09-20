import "../styles.css";

import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { HonoClient } from "@blog/shared";
import { Header } from "#/components/Header.tsx";

interface RouterContext {
	client: HonoClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<Header />
			<Outlet />
		</QueryClientProvider>
	);
}
