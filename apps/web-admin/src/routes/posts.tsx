import { useAuthStore } from "#/stores.ts";
import { fetchProtected } from "@blog/shared";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({
	beforeLoad: () => {
		const jwt = localStorage.getItem("jwt");
		if (!jwt) throw redirect({ to: "/login" });
	},
	component: Posts,
});

function Posts() {
	const user = useAuthStore((s) => s.user);
	const { client: apiClient } = useRouteContext({ from: "__root__" });

	const posts = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await fetchProtected(() => apiClient.api.posts.own.$get());
			if (!res) return null;
			return await res.json();
		},
	});

	if (posts.isLoading) return;
	if (posts.isError || (posts.data && !("data" in posts.data))) {
		return <p>{posts.data && "message" in posts.data && posts.data.message}</p>;
	}

	return (
		<main>
			<div className="flex items-center gap-2 text-sm">
				<h1 className="text-2xl font-bold me-auto">
					Welcome {user?.display_name}, here are your posts and drafts.
				</h1>
				<Link to="/posts/add" className="link">
					New post
				</Link>
			</div>
			{posts.data?.data.map((post) => (
				<Link
					to="/posts/$postId"
					params={{ postId: post.id.toString() }}
					key={`post_${post.id}`}
				>
					<article className="bg-white shadow p-4 rounded flex flex-col gap-2">
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
							{post.content.length > 50
								? `${post.content.slice(0, 50)}...`
								: post.content}
						</p>
					</article>
				</Link>
			))}
		</main>
	);
}
