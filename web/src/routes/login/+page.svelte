<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiError, loginRequest } from '$lib/api';
	import { auth } from '$lib/auth.svelte';
	import { Eye, EyeOff, LoaderCircle, Lock, Mail } from '@lucide/svelte';

	let email = $state('admin@hmdp.local');
	let password = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await loginRequest(email.trim(), password);
			auth.setSession(response.token, response.user);
			await goto('/');
		} catch (err) {
			error =
				err instanceof ApiError
					? err.message
					: 'No se pudo conectar con el servidor. Revisa que la API este en marcha.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-grid flex min-h-screen items-center justify-center px-4 py-10">
	<div class="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-forest text-white">
				H
			</div>
			<h1 class="text-2xl font-semibold text-ink">Bienvenido de nuevo</h1>
			<p class="mt-1 text-sm text-ink/55">Ingresa para administrar HMDP</p>
		</div>

		{#if error}
			<div
				class="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				role="alert"
			>
				{error}
			</div>
		{/if}

		<form class="space-y-4" onsubmit={handleSubmit}>
			<label class="block">
				<span class="mb-1.5 block text-sm font-medium text-ink/80">Correo / Usuario</span>
				<div class="relative">
					<Mail class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/35" size={18} />
					<input
						class="w-full rounded-2xl border border-ink/10 bg-mist py-3 pr-3 pl-10 text-sm outline-none ring-leaf/30 focus:border-leaf focus:ring-2"
						type="email"
						name="email"
						autocomplete="username"
						placeholder="admin@hmdp.local"
						bind:value={email}
						required
					/>
				</div>
			</label>

			<label class="block">
				<span class="mb-1.5 block text-sm font-medium text-ink/80">Contrasena</span>
				<div class="relative">
					<Lock class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/35" size={18} />
					<input
						class="w-full rounded-2xl border border-ink/10 bg-mist py-3 pr-12 pl-10 text-sm outline-none ring-leaf/30 focus:border-leaf focus:ring-2"
						type={showPassword ? 'text' : 'password'}
						name="password"
						autocomplete="current-password"
						placeholder="Tu contrasena"
						bind:value={password}
						required
					/>
					<button
						type="button"
						class="absolute top-1/2 right-3 -translate-y-1/2 text-ink/45 hover:text-ink"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
					>
						{#if showPassword}
							<EyeOff size={18} />
						{:else}
							<Eye size={18} />
						{/if}
					</button>
				</div>
			</label>

			<button
				type="submit"
				class="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-3 text-sm font-semibold text-white transition hover:bg-[#188a64] disabled:cursor-not-allowed disabled:opacity-70"
				disabled={loading}
			>
				{#if loading}
					<LoaderCircle class="animate-spin" size={18} />
					Ingresando...
				{:else}
					Entrar
				{/if}
			</button>
		</form>
	</div>
</div>
