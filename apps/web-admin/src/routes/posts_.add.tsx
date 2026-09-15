import { fetchProtected } from "#/lib.ts";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/posts_/add")({
	component: NewPost,
});

function NewPost() {
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

	const onAbortConfirmation = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) => {
		if (!confirm("Are you sure you want to quit? All changes would be lost.")) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
		<main className="gap-2">
			<Link
				to="/posts"
				className="absolute top-4 left-4 link"
				onClick={onAbortConfirmation}
			>
				See all posts
			</Link>
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
