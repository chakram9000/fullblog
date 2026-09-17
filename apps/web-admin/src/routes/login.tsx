import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	beforeLoad: () => {
		const jwt = localStorage.getItem("jwt");
		if (jwt) throw redirect({ to: "/posts" });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { client: apiClient } = useRouteContext({ from: "__root__" });
	const navigate = useNavigate();

	const [errorMessage, setErrorMessage] = useState("");
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const res = await apiClient.auth.login.$post({ form: value });
			const data = await res.json();

			if (!res.ok || "message" in data) {
				setErrorMessage("message" in data ? data.message : "Login failed.");
				return;
			}

			if (data.data.role === "VIEWER") {
				setErrorMessage(
					"Sorry, you're not an author and can't access this dashboard.",
				);
				return;
			}

			localStorage.setItem("jwt", data.token);
			navigate({ to: "/posts" });
		},
	});

	return (
		<main className="m-0 max-w-md absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
			<form
				onSubmit={(e) => {
					e.stopPropagation();
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<h1 className="text-center text-2xl font-bold">Login</h1>
				<p className="text-red-500">{errorMessage}</p>
				<form.Field
					name="email"
					children={(field) => {
						return (
							<div>
								<label htmlFor={field.name}>Email:</label>
								<input
									required
									type="email"
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
					name="password"
					children={(field) => {
						return (
							<div>
								<label htmlFor={field.name}>Password:</label>
								<input
									required
									type="password"
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
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<>
							<button type="submit" disabled={!canSubmit}>
								{isSubmitting ? "..." : "Submit"}
							</button>
						</>
					)}
				/>
			</form>
		</main>
	);
}
