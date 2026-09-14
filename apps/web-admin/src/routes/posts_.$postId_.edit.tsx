import { fetchProtected } from "#/lib.ts";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import type React from "react";

export const Route = createFileRoute("/posts_/$postId_/edit")({
	component: EditPost,
});

function EditPost() {
	const { postId } = Route.useParams();
	const context = useRouteContext({ from: "__root__" });
	const client = context.client;
	const queryClient = useQueryClient();

	const { data, isError, isLoading } = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await fetchProtected(() =>
				client.api.posts[":postId"].$get({ param: { postId } }),
			);

			if (!res) return null;
			return await res.json();
		},
	});

	const editPostMutation = useMutation({
		mutationFn: (value: { title?: string; content?: string }) =>
			client.api.posts[":postId"].$put({ param: { postId }, form: value }),
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
		onSubmit: async ({ value }) => {
			await editPostMutation.mutateAsync({
				...value,
			});

			await queryClient.invalidateQueries({
				queryKey: ["posts"],
			});
		},
	});

	const onLeaveCheckSaved = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
	) => {
		if (!data || !("data" in data)) return; // no need to check if the post's data itself is botched for some reason.

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
				onClick={onLeaveCheckSaved}
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
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<>
							<button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "..." : "Save"}
							</button>
						</>
					)}
				/>
			</form>
		</main>
	);
}
