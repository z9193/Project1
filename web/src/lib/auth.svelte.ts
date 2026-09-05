import { browser } from '$app/environment';
import { persistToken } from './api';
import type { User } from './types';

const USER_KEY = 'hmdp_user';

function readUser(): User | null {
	if (!browser) return null;
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as User;
	} catch {
		return null;
	}
}

class AuthState {
	token = $state<string | null>(null);
	user = $state<User | null>(null);
	ready = $state(false);

	constructor() {
		if (browser) {
			this.token = localStorage.getItem('hmdp_token');
			this.user = readUser();
			this.ready = true;
		}
	}

	get isAuthenticated(): boolean {
		return Boolean(this.token && this.user);
	}

	setSession(token: string, user: User): void {
		this.token = token;
		this.user = user;
		persistToken(token);
		if (browser) localStorage.setItem(USER_KEY, JSON.stringify(user));
	}

	logout(): void {
		this.token = null;
		this.user = null;
		persistToken(null);
		if (browser) localStorage.removeItem(USER_KEY);
	}

	initials(): string {
		const name = this.user?.full_name?.trim() || this.user?.email || 'U';
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}
}

export const auth = new AuthState();
