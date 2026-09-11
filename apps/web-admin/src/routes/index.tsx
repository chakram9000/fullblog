import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;

	const posts = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await client.api.posts.$get();
			return await res.json();
		},
	});

	if (posts.isLoading) return;
	if (posts.isError) {
		if (import.meta.env.DEV) console.error(posts.error);
		return <p>Error!</p>;
	}

	return (
		<main>
			{posts.data?.data.map((post) => (
				<h1>{post.title}</h1>
			))}
		</main>
	);
}
