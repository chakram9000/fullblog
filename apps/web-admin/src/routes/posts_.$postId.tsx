import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/posts_/$postId")({ component: Home });

function Home() {
	const { postId } = Route.useParams();
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;

	const post = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await client.api.posts[":postId"].$get({ param: { postId } });
			if (!res.ok) throw new Error();
			return (await res.json()).data;
		},
	});

	if (post.isLoading) return;
	if (post.isError) {
		if (import.meta.env.DEV) console.error(post.error);
		return <p>Error!</p>;
	}

	return (
		<main className="gap-2">
			<Link to="/posts">
				<p className="absolute top-4 left-4 underline">See all posts</p>
			</Link>
			<h2 className="text-2xl font-bold italic">{post.data?.title}</h2>
			<p className="text-lg text-slate-500">{post.data?.content}</p>
		</main>
	);
}
