import { HeaderLayout, useAuthStore } from "@blog/shared";
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
		<HeaderLayout>
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
		</HeaderLayout>
	);
}
