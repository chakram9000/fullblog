import { fetchProtected } from "@blog/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute("/posts_/$postId")({ component: Post });

function Post() {
	const { postId } = Route.useParams();
	const { client: apiClient } = useRouteContext({ from: "__root__" });
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["posts", postId],
		queryFn: async () => {
			const res = await fetchProtected(() =>
				apiClient.api.posts[":postId"].$get({ param: { postId } }),
			);

			if (!res) return null;
			return await res.json();
		},
	});

	const onTogglePublish = async () => {
		if (!data || !("data" in data)) return;

		const message = data.data.is_published
			? "Are you sure you want to unpublish this? comments and likes will NOT be deleted, but no one except you will be to access this post."
			: "Are you sure you want to to publish this? it will be available publicily, along with likes and comments.";
		if (!confirm(message)) return;

		await fetchProtected(() =>
			apiClient.api.posts[":postId"].$put({
				param: { postId },
				form: { is_published: `${!data.data.is_published}` },
			}),
		);
		await queryClient.invalidateQueries({ queryKey: ["posts"] });
		navigate({ to: "/posts" });
	};

	const onClickDelete = async () => {
		if (!data || !("data" in data)) return;
		if (
			!confirm(
				"Are you sure you want to delete this? Comments and likes WILL ALSO be deleted. THIS CAN'T BE UNDONE",
			)
		)
			return;

		await fetchProtected(() =>
			apiClient.api.posts[":postId"].$delete({ param: { postId } }),
		);
		await queryClient.invalidateQueries({ queryKey: ["posts"] });
		navigate({ to: "/posts" });
	};

	if (isLoading) return;
	if (isError || (data && !("data" in data))) {
		return <p>{data && "message" in data && data.message}</p>;
	}

	return (
		<main className="gap-4">
			<div className="flex items-center gap-2 text-sm">
				<h1 className="text-2xl font-bold italic me-auto">
					{data?.data.title}
				</h1>
				<Link to="/posts/$postId/edit" params={{ postId }} className="link">
					Edit
				</Link>
				<button className="link" onClick={onTogglePublish}>
					{data?.data.is_published ? "Unpublish" : "Publish"}
				</button>
				<button className="link text-red-800" onClick={onClickDelete}>
					Delete
				</button>
			</div>
			<p className="text-lg text-black text-justify wrap-break-word">
				{data?.data.content}
			</p>
		</main>
	);
}
