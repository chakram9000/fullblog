import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "../styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ClientType } from "../main.tsx";

interface RouterContext {
	client: ClientType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<h1 className="font-black">Admin dashboard</h1>
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
