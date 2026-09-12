import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/posts_/$postId")({ component: Post });

function Post() {
	const [jwt] = useState(() => localStorage.getItem("jwt"));
	const { postId } = Route.useParams();
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;
	const naviagtor = useNavigate();

	const post = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await client.api.posts[":postId"].$get(
				{ param: { postId } },
				{ headers: { Authorization: `Bearer ${jwt}` } },
			);

			// @TODO: add a hook or something for this repeated auth stuff.
			if (res.status === 401) {
				localStorage.removeItem("jwt");
				await naviagtor({ to: "/login" });
				return null;
			}

			return await res.json();
		},
	});

	if (post.isLoading) return;
	if (post.isError || !post.data || "message" in post.data) {
		return <p>{post.data && "message" in post.data && post.data.message}</p>;
	}

	return (
		<main className="gap-2">
			<Link to="/posts">
				<p className="absolute top-4 left-4 underline">See all posts</p>
			</Link>
			<h2 className="text-2xl font-bold italic">{post.data.data.title}</h2>
			<p className="text-lg text-slate-500">{post.data.data.content}</p>
		</main>
	);
}
