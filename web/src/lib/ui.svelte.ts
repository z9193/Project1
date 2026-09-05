class UiState {
	collapsed = $state(false);
	mobileOpen = $state(false);

	toggleCollapsed(): void {
		this.collapsed = !this.collapsed;
	}

	openMobile(): void {
		this.mobileOpen = true;
	}

	closeMobile(): void {
		this.mobileOpen = false;
	}

	toggleMobile(): void {
		this.mobileOpen = !this.mobileOpen;
	}
}

export const ui = new UiState();
