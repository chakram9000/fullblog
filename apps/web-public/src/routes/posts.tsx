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
			<Link to="/" className="absolute top-4 left-4 link text-emerald-900">
				Index
			</Link>
			<h1 className="text-2xl font-bold me-auto">Check out the posts!</h1>
			<div className="h-px bg-emerald-900" />
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
