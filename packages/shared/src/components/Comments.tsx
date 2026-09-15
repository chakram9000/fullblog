import type { Comment } from "api/src/generated/prisma/client.ts";

type CommentsProps = {
	comments: (Comment & { created_at: string } & {
		author: { id: number; email: string; display_name: string };
	})[];
};
export function Comments({ comments }: CommentsProps) {
	return (
		<div className="flex flex-col items-stretch gap-2">
			<h2 className="text-xl font-bold">Comments</h2>
			{comments.length > 0
				? comments.map((c) => (
						<div className="flex flex-col card" key={`comment_${c.id}`}>
							<div className="flex items-center gap-2">
								<h3 className="text-lg font-bold">{c.author.display_name}</h3>
								<p className="text-sm">
									{"<"}
									{c.author.email}
									{">"}
								</p>
								<p className="ms-auto opacity-60">{c.created_at}</p>
							</div>
							<p>{c.content}</p>
						</div>
					))
				: "No comments found."}
		</div>
	);
}
