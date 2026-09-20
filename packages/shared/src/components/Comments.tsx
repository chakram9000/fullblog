import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import type { HonoClient } from "../api.ts";
import { AddCommentForm } from "./AddCommentForm.tsx";
import { clsx } from "clsx";
import { useState } from "react";
import { EditCommentForm } from "./EditCommentForm.tsx";

type CommentsProps = {
	apiClient: HonoClient;
	tanQueryClient: QueryClient;
	postId: string;
	userId?: number;
	showAddCommentForm?: boolean;
};

// @TODO: comment deletion.
export function Comments({
	apiClient,
	tanQueryClient,
	postId,
	userId,
	showAddCommentForm,
}: CommentsProps) {
	const [commentToEditId, setCommentToEditId] = useState<number | null>(null);

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

	const deletionMutation = useMutation({
		mutationKey: ["comments", postId],
		mutationFn: async (commentId: number) => {
			if (!confirm("Are you sure you want to delete this comment?")) return;

			const res = await apiClient.api.posts[":postId"].comments[
				":commentId"
			].$delete({
				param: { postId, commentId: commentId.toString() },
			});

			if (!res.ok) return;

			tanQueryClient.invalidateQueries({ queryKey: ["comments", postId] });
		},
	});

	const handleCommentEditDone = () => {
		tanQueryClient.invalidateQueries({
			queryKey: ["comments", postId],
		});
		setCommentToEditId(null);
	};

	if (isLoading) return;
	if (isError || !comments) {
		return <p>An error occured.</p>;
	}

	return (
		<div className="flex flex-col items-stretch gap-2">
			<h2 className="text-xl font-bold">Comments</h2>
			{showAddCommentForm && (
				<AddCommentForm
					tanQueryClient={tanQueryClient}
					postId={postId}
					apiClient={apiClient}
				/>
			)}
			{comments.data.length > 0
				? comments.data.map((c) => (
						<div
							className={clsx(
								"flex flex-col items-stretch card",
								userId === c.authorId && "border border-emerald-500",
							)}
							key={`comment_${c.id}`}
						>
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-bold">{c.author.display_name}</h3>
								{userId === c.author.id && (
									<p className="text-emerald-700">(YOU)</p>
								)}
								<p className="text-sm me-auto text-emerald-800">
									{"<"}
									{c.author.email}
									{">"}
								</p>
								<p className="opacity-60">{c.created_at}</p>
								{c.authorId === userId && c.id !== commentToEditId && (
									<>
										<button
											className="link"
											onClick={() => setCommentToEditId(c.id)}
										>
											Edit
										</button>
										<button
											className="link text-red-500"
											onClick={() => deletionMutation.mutate(c.id)}
										>
											DEL
										</button>
									</>
								)}
							</div>
							{c.id !== commentToEditId ? (
								<p>{c.content}</p>
							) : (
								<EditCommentForm
									tanQueryClient={tanQueryClient}
									postId={postId}
									apiClient={apiClient}
									comment={c}
									doneCB={handleCommentEditDone}
								/>
							)}
						</div>
					))
				: "No comments found."}
		</div>
	);
}
