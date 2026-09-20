import { useAuthStore } from "@blog/shared";
import { type HonoClient } from "@blog/shared";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Props {
	postId: string;
	apiClient: HonoClient;
}

export function Like({ postId, apiClient }: Props) {
	const user = useAuthStore((s) => s.user);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["likes", postId],
		queryFn: async () => {
			const res = await apiClient.api.posts[":postId"].likes.$get({
				param: { postId },
			});

			if (!res) return null;
			return await res.json();
		},
	});

	const mutation = useMutation({
		mutationKey: ["likes", postId],
		mutationFn: async () => {
			const res = await apiClient.api.posts[":postId"].likes.$post({
				param: { postId },
			});

			if (!res || !res.ok) return null;
			refetch();
		},
	});

	if (isLoading || isError || !data || !("data" in data)) return;

	return (
		<div className="text-emerald-800">
			{user ? (
				<button
					className="hover:cursor-pointer"
					onClick={() => mutation.mutate()}
				>
					{data.data} Likes
				</button>
			) : (
				<p>{data.data} Likes</p>
			)}
		</div>
	);
}
