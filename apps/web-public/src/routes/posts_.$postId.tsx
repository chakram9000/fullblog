import { Comments } from "@blog/shared";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/posts_/$postId")({ component: Post });

function Post() {
	const { postId } = Route.useParams();
	const { client: apiClient } = useRouteContext({ from: "__root__" });

	const { data, isLoading, isError } = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await apiClient.api.posts[":postId"].$get({
				param: { postId },
			});

			if (!res) return null;
			return await res.json();
		},
	});

	if (isLoading) return;
	if (isError || !data || !("data" in data)) {
		return <p>An error occured</p>;
	}

	return (
		<main className="gap-4">
			<Link to="/posts" className="absolute top-4 left-4 link text-emerald-900">
				See all posts
			</Link>
			<div className="flex items-center gap-2 text-sm">
				<h1 className="text-2xl font-bold italic me-auto">
					{data?.data.title}
				</h1>
			</div>
			<p className="text-lg text-black text-justify wrap-break-word">
				{data?.data.content}
			</p>
			<div className="h-px bg-emerald-600"></div>
			<Comments apiClient={apiClient} postId={postId} />
		</main>
	);
}
