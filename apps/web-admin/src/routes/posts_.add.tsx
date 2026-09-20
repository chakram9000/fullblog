import { fetchProtected } from "@blog/shared";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	redirect,
	useBlocker,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/posts_/add")({
	beforeLoad: () => {
		const jwt = localStorage.getItem("jwt");
		if (!jwt) throw redirect({ to: "/login" });
	},
	component: NewPost,
});

function NewPost() {
	useBlocker({
		shouldBlockFn: () => {
			return !confirm(
				"Are you sure you want to leave? This post will be lost.",
			);
		},
	});

	const { client: apiClient } = useRouteContext({ from: "__root__" });
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	const form = useForm({
		defaultValues: {
			title: "",
			content: "",
			is_published: false,
		},
		onSubmit: async ({ value }) => {
			const res = await fetchProtected(() =>
				apiClient.api.posts.$post({
					form: { ...value, is_published: `${value.is_published}` },
				}),
			);

			if (!res) return;

			const data = await res.json();
			if (!res.ok) {
				setErrorMessage("message" in data ? data.message : "An error occured.");
				return;
			}

			await queryClient.invalidateQueries({ queryKey: ["posts"] });
			navigate({ to: "/posts" });
		},
	});

	return (
		<main className="gap-2">
			<form
				onSubmit={(e) => {
					e.stopPropagation();
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<p className="text-red-500">{errorMessage}</p>
				<form.Field
					name="title"
					children={(field) => {
						return (
							<div>
								<label htmlFor={field.name}>Title:</label>
								<input
									required
									type="text"
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						);
					}}
				/>
				<form.Field
					name="content"
					children={(field) => {
						return (
							<div>
								<label htmlFor={field.name}>Content:</label>
								<textarea
									required
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="resize-y overflow-y-auto min-h-64 lg:min-h-96"
								/>
							</div>
						);
					}}
				/>
				<form.Field
					name="is_published"
					children={(field) => {
						return (
							<div className="flex flex-row items-center gap-2">
								<label htmlFor={field.name}>Publish immediately?</label>
								<input
									type="checkbox"
									id={field.name}
									name={field.name}
									checked={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.checked)}
								/>
							</div>
						);
					}}
				/>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<button type="submit" disabled={!canSubmit}>
							{isSubmitting ? "..." : "Post!"}
						</button>
					)}
				/>
			</form>
		</main>
	);
}
