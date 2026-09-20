import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "../styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { HonoClient } from "@blog/shared";
import { useAuthStore } from "#/stores.ts";
import { Header } from "#/components/header.tsx";

interface RouterContext {
	client: HonoClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
	const user = useAuthStore((s) => s.user);

	return (
		<QueryClientProvider client={queryClient}>
			{user && <Header />}
			<Outlet />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</QueryClientProvider>
	);
}
