<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { auth } from '$lib/auth.svelte';
	import { ui } from '$lib/ui.svelte';
	import {
		Bell,
		ChevronLeft,
		LayoutDashboard,
		LogOut,
		Menu,
		Settings,
		Shield,
		Users,
		X
	} from '@lucide/svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const isLogin = $derived(page.url.pathname.startsWith('/login'));

	const navItems = [
		{ href: '/', label: 'Inicio', icon: LayoutDashboard },
		{ href: '/', label: 'Usuarios', icon: Users, soon: true },
		{ href: '/', label: 'Roles', icon: Shield, soon: true },
		{ href: '/', label: 'Ajustes', icon: Settings, soon: true }
	];

	$effect(() => {
		if (!browser || !auth.ready) return;
		if (!isLogin && !auth.token) {
			void goto('/login');
		} else if (isLogin && auth.token) {
			void goto('/');
		}
	});

	function logout() {
		auth.logout();
		ui.closeMobile();
		void goto('/login');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>HMDP Admin</title>
</svelte:head>

{#if !browser || !auth.ready}
	<div class="grid min-h-screen place-items-center bg-mist text-sm text-ink/50">Cargando...</div>
{:else if isLogin}
	{@render children()}
{:else if !auth.token}
	<div class="grid min-h-screen place-items-center bg-mist text-sm text-ink/50">Redirigiendo...</div>
{:else}
	<div class="flex min-h-screen bg-mist text-ink">
		{#if ui.mobileOpen}
			<button
				class="fixed inset-0 z-30 bg-ink/40 md:hidden"
				aria-label="Cerrar menu"
				onclick={() => ui.closeMobile()}
			></button>
		{/if}

		<aside
			class={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-forest text-white transition-all duration-200 md:static ${
				ui.collapsed ? 'md:w-[84px]' : 'md:w-64'
			} ${ui.mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 w-64'}`}
		>
			<div class="flex h-16 items-center justify-between px-4">
				<div class="flex items-center gap-3 overflow-hidden">
					<div
						class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf text-sm font-bold"
					>
						H
					</div>
					{#if !ui.collapsed || ui.mobileOpen}
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold">HMDP Admin</p>
							<p class="truncate text-xs text-white/60">Panel de control</p>
						</div>
					{/if}
				</div>
				<button
					class="rounded-lg p-1 text-white/70 hover:bg-white/10 md:hidden"
					onclick={() => ui.closeMobile()}
					aria-label="Cerrar navegacion"
				>
					<X size={18} />
				</button>
			</div>

			<nav class="mt-2 flex-1 space-y-1 px-3">
				{#each navItems as item}
					{@const active = item.href === '/' && page.url.pathname === '/' && !item.soon}
					<a
						href={item.href}
						onclick={() => ui.closeMobile()}
						class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
							active
								? 'bg-leaf text-white shadow-sm'
								: 'text-white/70 hover:bg-white/10 hover:text-white'
						} ${ui.collapsed && !ui.mobileOpen ? 'justify-center' : ''}`}
						title={item.soon ? `${item.label} (proximo)` : item.label}
					>
						<item.icon size={18} />
						{#if !ui.collapsed || ui.mobileOpen}
							<span class="flex-1">{item.label}</span>
							{#if item.soon}
								<span class="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">Pronto</span>
							{/if}
						{/if}
					</a>
				{/each}
			</nav>

			<button
				class="m-3 hidden items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/10 md:flex"
				onclick={() => ui.toggleCollapsed()}
			>
				<ChevronLeft size={16} class={ui.collapsed ? 'rotate-180' : ''} />
				{#if !ui.collapsed}
					<span>Colapsar</span>
				{/if}
			</button>
		</aside>

		<div class="flex min-w-0 flex-1 flex-col">
			<header
				class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink/10 bg-white/90 px-4 backdrop-blur"
			>
				<div class="flex items-center gap-3">
					<button
						class="rounded-lg p-2 text-ink/70 hover:bg-mist md:hidden"
						onclick={() => ui.toggleMobile()}
						aria-label="Abrir menu"
					>
						<Menu size={20} />
					</button>
					<div>
						<p class="text-sm font-semibold">Administracion</p>
						<p class="text-xs text-ink/50">Sistema HMDP</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<button
						class="rounded-xl p-2 text-ink/50 hover:bg-mist"
						aria-label="Notificaciones"
					>
						<Bell size={18} />
					</button>
					<div class="hidden text-right sm:block">
						<p class="text-sm font-medium">{auth.user?.full_name ?? 'Usuario'}</p>
						<p class="text-xs capitalize text-ink/50">{auth.user?.role?.name ?? 'sesion'}</p>
					</div>
					<div
						class="grid h-9 w-9 place-items-center rounded-full bg-forest text-xs font-semibold text-white"
					>
						{auth.initials()}
					</div>
					<button
						class="inline-flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm text-ink/80 hover:bg-mist"
						onclick={logout}
					>
						<LogOut size={16} />
						<span class="hidden sm:inline">Cerrar sesion</span>
					</button>
				</div>
			</header>

			<main class="flex-1 p-4 md:p-6">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
