import { useForm } from "@tanstack/react-form";
import { fetchProtected, HonoClient } from "../api";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";

interface Props {
	apiClient: HonoClient;
	tanQueryClient: QueryClient;
	postId: string;
	comment: { id: number; content: string };
	doneCB: () => void;
}

export function EditCommentForm({
	apiClient,
	tanQueryClient,
	postId,
	comment,
	doneCB,
}: Props) {
	const [errorMessage, setErrorMessage] = useState("");
	const form = useForm({
		defaultValues: {
			content: comment.content,
		},
		onSubmit: async ({ value, formApi }) => {
			const res = await fetchProtected(() =>
				apiClient.api.posts[":postId"].comments[":commentId"].$put({
					param: { postId, commentId: comment.id.toString() },
					form: value,
				}),
			);
			if (!res) return;

			const data = await res.json();
			if ("message" in data) {
				setErrorMessage(data.message);
				return;
			}

			formApi.reset();
			tanQueryClient.invalidateQueries({ queryKey: ["comments", postId] });
			doneCB();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.stopPropagation();
				e.preventDefault();
				form.handleSubmit();
			}}
			className="gap-2 mb-4"
		>
			<form.Field
				name="content"
				children={(field) => {
					return (
						<textarea
							required
							placeholder="Start typing..."
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="resize-none field-sizing-content"
						/>
					);
				}}
			/>
			{errorMessage && <p className="text-red-500">{errorMessage}</p>}
			<div className="flex flex-row items-center *:flex-1 gap-4">
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<button
							type="submit"
							disabled={!canSubmit}
							className="h-8 p-1 text-sm"
						>
							{isSubmitting ? "..." : "Edit"}
						</button>
					)}
				/>
				<button className="bg-red-600 h-8 p-1 text-sm" onClick={() => doneCB()}>
					Cancel
				</button>
			</div>
		</form>
	);
}
