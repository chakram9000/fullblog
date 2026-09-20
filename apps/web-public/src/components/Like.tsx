import { useAuthStore } from "@blog/shared";
import { type HonoClient } from "@blog/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";

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
		<div>
			{user ? (
				<button
					className="hover:cursor-pointer text-emeralt-700 px-2 py-1 bg-white border-2 border-emerald-200 rounded-sm"
					onClick={() => mutation.mutate()}
				>
					{data.data} Likes
				</button>
			) : (
				<p className="text-emerald-800">{data.data} Likes</p>
			)}
		</div>
	);
}
