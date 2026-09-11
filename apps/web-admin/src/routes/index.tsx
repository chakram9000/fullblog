import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";

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
		<main className="w-screen max-w-2xl mx-auto px-2 py-8 flex flex-col items-stretch gap-6">
			{posts.data?.data.map((post) => (
				<article
					className="bg-amber-50 p-4 rounded-md flex flex-col gap-2"
					key={post.id}
				>
					<h2 className="text-2xl font-bold italic">{post.title}</h2>
					<p className="text-lg text-slate-500">
						{post.content.length > 30
							? `${post.content.slice(0, 30)}...`
							: post.content}
					</p>
				</article>
			))}
		</main>
	);
}
