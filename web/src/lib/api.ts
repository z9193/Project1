import { browser } from '$app/environment';
import type { DashboardSummary, LoginResponse } from './types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const TOKEN_KEY = 'hmdp_token';

export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

export function getStoredToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function persistToken(token: string | null): void {
	if (!browser) return;
	if (token) localStorage.setItem(TOKEN_KEY, token);
	else localStorage.removeItem(TOKEN_KEY);
}

async function parseBody(res: Response): Promise<unknown> {
	if (res.status === 204) return null;
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return { error: text };
	}
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers = new Headers(options.headers);
	if (!headers.has('Content-Type') && options.body) {
		headers.set('Content-Type', 'application/json');
	}

	const token = getStoredToken();
	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
	}

	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers
	});

	const data = await parseBody(res);
	if (!res.ok) {
		const message =
			data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
				? data.error
				: 'No se pudo completar la solicitud';
		throw new ApiError(res.status, message);
	}

	return data as T;
}

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
	return api<LoginResponse>('/api/login', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	});
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
	return api<DashboardSummary>('/api/dashboard/summary');
}

export function fetchCurrentUser() {
	return api<{ user: LoginResponse['user'] }>('/api/auth/me');
}
