import { useAuthStore } from "#/stores.ts";
import { Link, useRouter } from "@tanstack/react-router";

export function Header() {
	const logout = useAuthStore((s) => s.logout);
	const router = useRouter();

	const handleLogout = () => {
		localStorage.removeItem("jwt");
		logout();
		router.invalidate();
	};

	return (
		<header className="bg-emerald-50 min-h-14 shadow flex items-center justify-center p-2 w-screen">
			<div className="w-full max-w-6xl flex items-center justify-between">
				<Link to="/posts" className="text-2xl font-bold">
					Blog's blog author dashboard
				</Link>
				<nav className="flex items-center gap-5">
					<Link to="/posts">your posts</Link>
					<Link to="/posts/add">new post</Link>
					<button onClick={handleLogout}>logout</button>
				</nav>
			</div>
		</header>
	);
}
