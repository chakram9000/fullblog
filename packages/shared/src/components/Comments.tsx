import { useQuery } from "@tanstack/react-query";
import type { HonoClient } from "../api.ts";

type CommentsProps = {
	apiClient: HonoClient;
	postId: string;
};

export function Comments({ apiClient, postId }: CommentsProps) {
	const {
		data: comments,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["comments", postId],
		queryFn: async () => {
			const res = await apiClient.api.posts[":postId"].comments.$get({
				param: { postId },
			});

			if (!res.ok) return null;
			return await res.json();
		},
	});

	if (isLoading) return;
	if (isError || !comments) {
		return <p>An error occured.</p>;
	}

	return (
		<div className="flex flex-col items-stretch gap-2">
			<h2 className="text-xl font-bold">Comments</h2>
			{comments.data.length > 0
				? comments.data.map((c) => (
						<div className="flex flex-col card" key={`comment_${c.id}`}>
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-bold">{c.author.display_name}</h3>
								<p className="text-sm">
									{"<"}
									{c.author.email}
									{">"}
								</p>
								<p className="ms-auto opacity-60">{c.created_at}</p>
							</div>
							<p>{c.content}</p>
						</div>
					))
				: "No comments found."}
		</div>
	);
}
