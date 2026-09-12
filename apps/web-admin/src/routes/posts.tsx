import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/posts")({
	beforeLoad: () => {
		const jwt = localStorage.getItem("jwt");
		if (!jwt) throw redirect({ to: "/login" });
	},
	component: Home,
});

function Home() {
	const [jwt] = useState(() => localStorage.getItem("jwt"));
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;

	const posts = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await client.api.posts.own.$get(undefined, {
				headers: {
					Authorization: `Bearer ${jwt}`,
				},
			});
			return await res.json();
		},
	});

	if (posts.isLoading) return;
	if (posts.isError || "message" in posts.data!) {
		return <p>{"message" in posts.data! && posts.data.message}</p>;
	}

	return (
		<main>
			{posts.data?.data.map((post) => (
				<Link to="/posts/$postId" params={{ postId: post.id.toString() }}>
					<article
						className="bg-white shadow p-4 rounded flex flex-col gap-2"
						key={post.id}
					>
						<div className="flex items-center">
							<h2 className="text-2xl font-bold italic me-auto">
								{post.title}
							</h2>
							{post.is_published ? (
								<p className="text-green-500">Published</p>
							) : (
								<p className="text-red-500">Draft</p>
							)}
						</div>
						<p className="text-lg text-slate-500">
							{post.content.length > 30
								? `${post.content.slice(0, 30)}...`
								: post.content}
						</p>
					</article>
				</Link>
			))}
		</main>
	);
}
