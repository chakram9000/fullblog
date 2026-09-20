import { create } from "zustand";
import { HonoClient } from "./api";

interface User {
	id: number;
	email: string;
	display_name: string;
}

interface AuthState {
	user: User | null;
	login: (user: User) => void;
	logout: () => void;
	checkin: (honoClient: HonoClient) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
	user: null,
	login: (user) => set({ user }),
	logout: () => set({ user: null }),
	checkin: async (honoClient: HonoClient) => {
		const res = await honoClient.auth.checkin.$get();
		if (!res.ok) return;

		const data = await res.json();
		set({ user: data.data });
	},
}));
