import { fetchProtected } from "@blog/shared";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";

export const Route = createFileRoute("/posts_/$postId_/edit")({
	component: EditPost,
});

function EditPost() {
	const { postId } = Route.useParams();
	const { client: apiClient } = useRouteContext({ from: "__root__" });
	const queryClient = useQueryClient();
	const [errorMessage, setErrorMessage] = useState("");

	const { data, isError, isLoading } = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await fetchProtected(() =>
				apiClient.api.posts[":postId"].$get({ param: { postId } }),
			);

			if (!res) return null;
			return await res.json();
		},
	});

	const form = useForm({
		defaultValues:
			data && "data" in data
				? {
						title: data.data.title,
						content: data.data.content,
					}
				: {
						title: "",
						content: "",
					},
		onSubmit: async ({ formApi, value }) => {
			const res = await fetchProtected(() =>
				apiClient.api.posts[":postId"].$put({ param: { postId }, form: value }),
			);

			if (!res) return;

			const data = await res.json();
			if (!res.ok) {
				setErrorMessage("message" in data ? data.message : "An error occured.");
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: ["posts"],
			});

			// @NOTE: this helps with trailing whitespaces triggering abort popup, because the api trims the input, while the form could still have it, causing different states.
			formApi.reset();
		},
	});

	const onAbortConfirmation = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) => {
		// no need to check if the post's data itself is botched for some reason.
		if (!data || !("data" in data)) return;

		// check if state differs from api's
		const formValues = form.state.values;
		if (
			formValues.title !== data.data.title ||
			formValues.content !== data.data.content
		) {
			if (
				!confirm(
					"You haven't saved! Are you sure you want to quit? All changes would be lost.",
				)
			) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
	};

	if (isLoading) return;
	if (isError || (data && !("data" in data))) {
		return <p>{data && "message" in data && data.message}</p>;
	}

	return (
		<main className="gap-2">
			<Link
				to="/posts/$postId"
				params={{ postId }}
				onClick={onAbortConfirmation}
				className="absolute top-4 left-4 link"
			>
				See post preview
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
				<form.Subscribe
					selector={(state) => [
						state.canSubmit,
						state.isSubmitting,
						state.isSubmitSuccessful,
					]}
					children={([canSubmit, isSubmitting, isSubmitSuccessful]) => (
						<>
							<button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "..." : isSubmitSuccessful ? "Saved!" : "Save"}
							</button>
						</>
					)}
				/>
			</form>
		</main>
	);
}
