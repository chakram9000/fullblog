import type { ReactNode } from "react";

interface Props {
	children: ReactNode[];
}

export function HeaderLayout({ children }: Props) {
	return (
		<header className="bg-emerald-50 min-h-14 shadow flex items-center justify-center p-2 w-screen">
			<div className="w-full max-w-6xl flex items-center justify-between">
				{children}
			</div>
		</header>
	);
}
