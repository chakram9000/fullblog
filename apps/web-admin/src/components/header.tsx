import { HeaderLayout, useAuthStore } from "@blog/shared";
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
		<HeaderLayout>
			<Link to="/posts" className="text-2xl font-bold">
				Blog's blog author dashboard
			</Link>
			<nav className="flex items-center gap-5">
				<Link to="/posts">your posts</Link>
				<Link to="/posts/add">new post</Link>
				<button onClick={handleLogout}>logout</button>
			</nav>
		</HeaderLayout>
	);
}
