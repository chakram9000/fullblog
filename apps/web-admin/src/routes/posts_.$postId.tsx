import { fetchProtected } from "#/lib.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/posts_/$postId")({ component: Post });

function Post() {
	const { postId } = Route.useParams();
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;

	const post = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await fetchProtected(() =>
				client.api.posts[":postId"].$get({ param: { postId } }),
			);

			if (!res) return null;
			return await res.json();
		},
	});

	if (post.isLoading) return;
	if (post.isError || (post.data && !("data" in post.data))) {
		return <p>{post.data && "message" in post.data && post.data.message}</p>;
	}

	return (
		<main className="gap-2">
			<Link to="/posts" className="absolute top-4 left-4 link">
				See all posts
			</Link>
			<div className="flex items-center">
				<h2 className="text-2xl font-bold italic me-auto">
					{post.data?.data.title}
				</h2>
				<Link to="/posts/$postId/edit" params={{ postId }} className="link">
					Edit
				</Link>
			</div>
			<p className="text-lg text-slate-500">{post.data?.data.content}</p>
		</main>
	);
}
