import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({
	component: Posts,
});

function Posts() {
	const { client: apiClient } = useRouteContext({ from: "__root__" });

	const posts = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const res = await apiClient.api.posts.$get();
			return await res.json();
		},
	});

	if (posts.isLoading) return;
	if (posts.isError) {
		return <p>An error occured</p>;
	}

	return (
		<main>
			<h1 className="text-2xl font-bold me-auto">Check out the posts!</h1>
			<div className="h-px bg-emerald-900" />
			{posts.data?.data.map((post) => (
				<Link
					to="/posts/$postId"
					params={{ postId: post.id.toString() }}
					key={`post_${post.id}`}
				>
					<article className="bg-white shadow-xs p-4 rounded-sm flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<h2 className="text-xl font-bold">{post.title}</h2>
							<p className="text-sm text-slate-400 italic me-auto">
								by {post.author.display_name}
							</p>
							<p>{post._count.likes} Likes</p>
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
