import { fetchProtectedHono } from "#/lib.ts";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/posts_/$postId/edit")({
	component: EditPost,
});

function EditPost() {
	const { postId } = Route.useParams();
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;
	const queryClient = useQueryClient();

	const post = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await fetchProtectedHono(() =>
				client.api.posts[":postId"].$get({ param: { postId } }),
			);

			if (!res) return null;
			return res.json();
		},
	});

	if (post.isLoading) return;
	if (post.isError || (post.data && !("data" in post.data))) {
		return <p>{post.data && "message" in post.data && post.data.message}</p>;
	}

	return (
		<main className="gap-2">
			<Link to="/posts">
				<p className="absolute top-4 left-4 underline">See all posts</p>
			</Link>
			<h2 className="text-2xl font-bold italic">{post.data?.data.title}</h2>
			<p className="text-lg text-slate-500">{post.data?.data.content}</p>
		</main>
	);
}
