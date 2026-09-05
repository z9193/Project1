<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchDashboardSummary } from '$lib/api';
	import { auth } from '$lib/auth.svelte';
	import {
		Activity,
		ArrowDownRight,
		ArrowUpRight,
		Shield,
		UserCheck,
		Users
	} from '@lucide/svelte';

	type Status = 'activo' | 'pendiente' | 'cancelado';

	type ActivityRow = {
		id: string;
		event: string;
		user: string;
		module: string;
		status: Status;
		when: string;
	};

	let loading = $state(true);
	let kpis = $state([
		{ label: 'Usuarios', value: '—', trend: 12.4, up: true, icon: Users, hint: 'vs. mes anterior' },
		{ label: 'Activos', value: '—', trend: 4.1, up: true, icon: UserCheck, hint: 'cuentas habilitadas' },
		{ label: 'Roles', value: '—', trend: 0, up: true, icon: Shield, hint: 'catalogo actual' },
		{ label: 'Sesiones', value: '—', trend: 2.8, up: false, icon: Activity, hint: 'actividad reciente' }
	]);

	const week = [
		{ day: 'Lun', value: 42 },
		{ day: 'Mar', value: 58 },
		{ day: 'Mie', value: 51 },
		{ day: 'Jue', value: 73 },
		{ day: 'Vie', value: 66 },
		{ day: 'Sab', value: 28 },
		{ day: 'Dom', value: 19 }
	];
	const maxWeek = Math.max(...week.map((item) => item.value));

	const activity: ActivityRow[] = [
		{
			id: '1',
			event: 'Inicio de sesion',
			user: 'Luis Supervisor',
			module: 'Autenticacion',
			status: 'activo',
			when: 'Hace 8 min'
		},
		{
			id: '2',
			event: 'Alta de usuario',
			user: 'Administrador',
			module: 'Usuarios',
			status: 'pendiente',
			when: 'Hace 26 min'
		},
		{
			id: '3',
			event: 'Cambio de rol',
			user: 'Maria Operador',
			module: 'Roles',
			status: 'activo',
			when: 'Hace 1 h'
		},
		{
			id: '4',
			event: 'Intento fallido',
			user: 'Invitado',
			module: 'Autenticacion',
			status: 'cancelado',
			when: 'Hace 3 h'
		}
	];

	const statusClass: Record<Status, string> = {
		activo: 'bg-emerald-50 text-emerald-700',
		pendiente: 'bg-amber-50 text-amber-700',
		cancelado: 'bg-rose-50 text-rose-700'
	};

	onMount(async () => {
		try {
			const summary = await fetchDashboardSummary();
			kpis = [
				{ ...kpis[0], value: String(summary.totals.users) },
				{ ...kpis[1], value: String(summary.totals.active_users) },
				{ ...kpis[2], value: String(summary.totals.roles) },
				{
					...kpis[3],
					value: String(summary.totals.active_users)
				}
			];
		} catch {
			kpis = kpis.map((item, index) => ({
				...item,
				value: ['3', '3', '3', '2'][index]
			}));
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto max-w-6xl space-y-6">
	<section>
		<p class="text-sm text-ink/50">Inicio</p>
		<h1 class="text-2xl font-semibold">
			Hola, {auth.user?.full_name?.split(' ')[0] ?? 'usuario'}
		</h1>
		<p class="text-sm text-ink/55">
			Resumen operativo del sistema de administracion.
		</p>
	</section>

	<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each kpis as kpi}
			<article class="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
				<div class="flex items-start justify-between">
					<div class="grid h-10 w-10 place-items-center rounded-xl bg-mist text-leaf">
						<kpi.icon size={18} />
					</div>
					<span
						class={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
							kpi.up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
						}`}
					>
						{#if kpi.up}
							<ArrowUpRight size={14} />
						{:else}
							<ArrowDownRight size={14} />
						{/if}
						{kpi.trend}%
					</span>
				</div>
				<p class="mt-4 text-2xl font-semibold">{loading ? '...' : kpi.value}</p>
				<p class="text-sm font-medium text-ink/80">{kpi.label}</p>
				<p class="text-xs text-ink/45">{kpi.hint}</p>
			</article>
		{/each}
	</section>

	<section class="grid gap-4 lg:grid-cols-3">
		<article class="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm lg:col-span-2">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="font-semibold">Actividad semanal</h2>
					<p class="text-xs text-ink/45">Contenedor listo para graficas o estadisticas clave</p>
				</div>
				<span class="rounded-full bg-mist px-3 py-1 text-xs text-ink/60">Ultimos 7 dias</span>
			</div>
			<div class="flex h-48 items-end gap-3">
				{#each week as item}
					<div class="flex flex-1 flex-col items-center gap-2">
						<div class="flex h-36 w-full items-end rounded-xl bg-mist">
							<div
								class="w-full rounded-xl bg-leaf/80"
								style={`height: ${(item.value / maxWeek) * 100}%`}
							></div>
						</div>
						<span class="text-[11px] text-ink/50">{item.day}</span>
					</div>
				{/each}
			</div>
		</article>

		<article class="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
			<h2 class="font-semibold">Estado del panel</h2>
			<p class="mt-1 text-sm text-ink/55">
				Conectado como {auth.user?.email}.
			</p>
			<ul class="mt-4 space-y-3 text-sm">
				<li class="flex justify-between rounded-xl bg-mist px-3 py-2">
					<span>Rol</span>
					<span class="capitalize font-medium">{auth.user?.role?.name ?? '—'}</span>
				</li>
				<li class="flex justify-between rounded-xl bg-mist px-3 py-2">
					<span>Permisos</span>
					<span class="font-medium">{auth.user?.permissions?.length ?? 0}</span>
				</li>
				<li class="flex justify-between rounded-xl bg-mist px-3 py-2">
					<span>API</span>
					<span class="font-medium text-leaf">REST lista</span>
				</li>
			</ul>
		</article>
	</section>

	<section class="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
		<div class="border-b border-ink/10 px-5 py-4">
			<h2 class="font-semibold">Actividad reciente</h2>
			<p class="text-xs text-ink/45">Estructura lista para sustituir por datos del backend</p>
		</div>
		<div class="overflow-x-auto">
			<table class="min-w-full text-left text-sm">
				<thead class="bg-mist/80 text-xs uppercase tracking-wide text-ink/50">
					<tr>
						<th class="px-5 py-3 font-medium">Evento</th>
						<th class="px-5 py-3 font-medium">Usuario</th>
						<th class="px-5 py-3 font-medium">Modulo</th>
						<th class="px-5 py-3 font-medium">Estado</th>
						<th class="px-5 py-3 font-medium">Cuando</th>
					</tr>
				</thead>
				<tbody>
					{#each activity as row}
						<tr class="border-t border-ink/5">
							<td class="px-5 py-3 font-medium">{row.event}</td>
							<td class="px-5 py-3 text-ink/70">{row.user}</td>
							<td class="px-5 py-3 text-ink/70">{row.module}</td>
							<td class="px-5 py-3">
								<span class={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass[row.status]}`}>
									{row.status}
								</span>
							</td>
							<td class="px-5 py-3 text-ink/50">{row.when}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
