export type Role = {
	id: string;
	name: string;
	description: string | null;
};

export type User = {
	id: string;
	email: string;
	full_name: string;
	is_active: boolean;
	last_login: string | null;
	created_at?: string;
	role: Role | null;
	permissions: string[];
};

export type LoginResponse = {
	token: string;
	token_type: string;
	user: User;
};

export type DashboardSummary = {
	totals: {
		users: number;
		active_users: number;
		roles: number;
	};
};
