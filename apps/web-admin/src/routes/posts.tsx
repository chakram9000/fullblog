import { useProtectedQuery } from "#/lib.ts";
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
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;

	const posts = useProtectedQuery({
		queryKey: ["posts"],
		queryFn: () => client.api.posts.own.$get(),
	});

	if (posts.isLoading) return;
	if (posts.isError || (posts.data && !("data" in posts.data))) {
		return <p>{posts.data && "message" in posts.data && posts.data.message}</p>;
	}

	return (
		<main>
			<h1 className="text-2xl font-bold text-center">
				Welcome Mr. Author, here are your posts and drafts.
			</h1>
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
