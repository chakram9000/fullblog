import { useAuthStore } from "@blog/shared";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const user = useAuthStore((s) => s.user);

	return (
		<main className="gap-3">
			<h1>Welcome to Fullblog!</h1>
			<div className="h-px bg-emerald-900" />
			{user ? (
				<p>You are logged in as {user.display_name}.</p>
			) : (
				<p>
					Have an account?{" "}
					<Link to="/login" className="link">
						Login.
					</Link>{" "}
					Don't?{" "}
					<Link to="/signup" className="link">
						Signup.
					</Link>
				</p>
			)}
			<p>
				Check out all the posts{" "}
				<Link to="/posts" className="link">
					here.
				</Link>
			</p>
		</main>
	);
}
