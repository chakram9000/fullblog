import { useForm } from "@tanstack/react-form";
import { fetchProtected, HonoClient } from "../api";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";

interface Props {
	apiClient: HonoClient;
	tanQueryClient: QueryClient;
	postId: string;
}

export function AddCommentForm({ apiClient, tanQueryClient, postId }: Props) {
	const [errorMessage, setErrorMessage] = useState("");
	const form = useForm({
		defaultValues: {
			content: "",
		},
		onSubmit: async ({ value, formApi }) => {
			const res = await fetchProtected(() =>
				apiClient.api.posts[":postId"].comments.$post({
					param: { postId },
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
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.stopPropagation();
				e.preventDefault();
				form.handleSubmit();
			}}
			className="gap-2"
		>
			<form.Field
				name="content"
				children={(field) => {
					return (
						<input
							required
							type="text"
							placeholder="Start typing..."
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					);
				}}
			/>
			{errorMessage && <p className="text-red-500">{errorMessage}</p>}
			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
				children={([canSubmit, isSubmitting]) => (
					<button
						type="submit"
						disabled={!canSubmit}
						className="h-8 p-1 text-sm"
					>
						{isSubmitting ? "..." : "Send comment"}
					</button>
				)}
			/>
		</form>
	);
}
