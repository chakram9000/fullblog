import { useAuthStore } from "#/stores.ts";
import { Link, useRouter } from "@tanstack/react-router";

export function Header() {
	const user = useAuthStore((s) => s.user);
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
				<Link to="/" className="text-3xl font-bold">
					Blog's blog
				</Link>
				<nav className="flex items-center gap-4">
					<Link to="/posts">posts</Link>
					{!user ? (
						<>
							<Link to="/login">login</Link>
							<Link to="/signup">signup</Link>
						</>
					) : (
						<>
							<button onClick={handleLogout}>logout</button>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
