<script>
  import { onDestroy, onMount } from 'svelte';
  import { createWorld } from './lib/world.js';
  import { projects } from './lib/projects.js';

  let canvas;
  let world;
  let started = $state(false);
  let hoveredId = $state(null);
  let selectedId = $state(null);
  let visited = $state(new Set());
  let elapsed = $state(0);
  let score = $state(42);
  let gameOver = $state(false);
  let blink = $state(true);
  let timerId;
  let blinkId;

  const selected = $derived(projects.find((item) => item.id === selectedId) ?? null);
  const hovered = $derived(projects.find((item) => item.id === hoveredId) ?? null);
  const minutes = $derived(String(Math.floor(elapsed / 60)).padStart(2, '0'));
  const seconds = $derived(String(elapsed % 60).padStart(2, '0'));

  function startGame() {
    if (started) return;
    started = true;
    world?.start();
    document.title = 'HMDP — PLAYER 1';
  }

  function openProject(id) {
    if (!started || gameOver) return;
    selectedId = id;
    world?.setSelected(id);
    visited = new Set([...visited, id]);
    score = Math.max(0, score + 7 - Math.floor(Math.random() * 4));
  }

  function closeProject() {
    selectedId = null;
    world?.setSelected(null);
  }

  function continueGame() {
    gameOver = false;
    elapsed = 0;
  }

  function onKey(event) {
    if (event.key === 'Enter') {
      if (!started) startGame();
      else if (hoveredId && !selectedId) openProject(hoveredId);
      else if (selectedId) closeProject();
      else if (gameOver) continueGame();
    }
    if (event.key === 'Escape') closeProject();
  }

  onMount(() => {
    world = createWorld(canvas, {
      onHover: (id) => {
        hoveredId = id;
      },
      onSelect: openProject
    });
    blinkId = setInterval(() => {
      blink = !blink;
    }, 520);
    timerId = setInterval(() => {
      if (!started || selectedId) return;
      elapsed += 1;
      if (elapsed > 0 && elapsed % 17 === 0) {
        score = Math.abs(Math.round((42 / (39 / (87 + (elapsed % 11)))) * 10));
      }
      if (elapsed >= 180) gameOver = true;
    }, 1000);
    window.addEventListener('keydown', onKey);
  });

  onDestroy(() => {
    world?.destroy();
    clearInterval(timerId);
    clearInterval(blinkId);
    window.removeEventListener('keydown', onKey);
  });
</script>

<canvas bind:this={canvas} class="stage"></canvas>
<div class="scanlines"></div>

{#if !started}
  <section class="intro">
    <p class="kicker">HMDP ARCHIVE</p>
    <h1 class:off={!blink}>PRESS ENTER<br />TO START</h1>
    <p class="hint">wasd no. mouse yes. enter abre el proyecto.</p>
  </section>
{/if}

{#if started}
  <header class="hud top">
    <p>PLAYER 1</p>
    <p>{visited.size}/12<br /><span>PROJECTS<br />VISITED</span></p>
    <p>{minutes}:{seconds}<br /><span>TIME<br />WASTED</span></p>
    <p>({score})<br /><span>RANDOM<br />SCORE</span></p>
  </header>

  <div class="constellation">
    {#each projects as project, index}
      <button
        class="title"
        class:hot={hoveredId === project.id || selectedId === project.id}
        class:seen={visited.has(project.id)}
        style={`--x:${8 + ((index * 17) % 78)}%; --y:${12 + ((index * 23) % 68)}%; --delay:${index * 80}ms`}
        onpointerenter={() => (hoveredId = project.id)}
        onclick={() => openProject(project.id)}
      >
        {project.title}
        <small>{project.year}</small>
      </button>
    {/each}
  </div>

  {#if hovered && !selected}
    <p class="prompt">Press Enter to see the project</p>
  {/if}
{/if}

{#if selected}
  <aside class="lightbox">
    <div class="sheet">
      <div class="meta">
        <p class="year">{selected.year}</p>
        <h2>{selected.title}</h2>
        <p class="blurb">{selected.blurb}</p>
        <button class="ghost" onclick={closeProject}>ESC / ENTER — close</button>
      </div>
      <div class="gallery">
        {#each Array.from({ length: selected.images }) as slide, index}
          <article class="cell" style={`background:${index % 2 ? selected.color : selected.accent}; color:${index % 2 ? selected.accent : selected.color}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{selected.title}</strong>
          </article>
        {/each}
      </div>
    </div>
  </aside>
{/if}

{#if gameOver && started && !selected}
  <section class="over">
    <h1>SORRY, THE GAME IS OVER</h1>
    <p>YOU HAVE TO GET BACK TO WORK NOW</p>
    <button onclick={continueGame}>CONTINUE</button>
  </section>
{/if}

<footer class="hud bottom">
  <a href="mailto:studio@hmdp.local">STUDIO@HMDP.LOCAL</a>
  <span>2026 © HMDP.ARCHIVE</span>
</footer>

<style>
  .stage {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .scanlines {
    pointer-events: none;
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px,
      transparent 3px
    );
    mix-blend-mode: overlay;
  }

  .intro,
  .over {
    position: fixed;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    z-index: 4;
    pointer-events: none;
  }

  h1 {
    margin: 0;
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(2.2rem, 8vw, 6.4rem);
    line-height: 1.15;
    letter-spacing: 0.04em;
    text-shadow: 0 0.08em 0 var(--cyan);
  }

  h1.off {
    opacity: 0.2;
  }

  .kicker,
  .hint,
  .prompt {
    font-family: 'Press Start 2P', monospace;
    font-size: 0.7rem;
    color: var(--cyan);
  }

  .hint {
    margin-top: 2rem;
    color: var(--muted);
  }

  .hud {
    position: fixed;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    padding: 1.2rem 1.6rem;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.62rem;
    line-height: 1.5;
    pointer-events: none;
  }

  .hud.top {
    top: 0;
  }

  .hud.bottom {
    bottom: 0;
    pointer-events: auto;
  }

  .hud span {
    color: var(--muted);
  }

  .hud a {
    color: inherit;
    text-decoration: none;
  }

  .constellation {
    position: fixed;
    inset: 0;
    z-index: 3;
  }

  .title {
    position: absolute;
    left: var(--x);
    top: var(--y);
    max-width: 220px;
    padding: 0;
    border: 0;
    background: none;
    color: #f3f3f3;
    font-family: 'VT323', monospace;
    font-size: 1.45rem;
    text-align: left;
    animation: drift 9s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .title small {
    display: block;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .title.hot {
    color: var(--cyan);
  }

  .title.seen {
    text-decoration: line-through;
    opacity: 0.55;
  }

  .prompt {
    position: fixed;
    left: 50%;
    bottom: 5.5rem;
    z-index: 6;
    transform: translateX(-50%);
  }

  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 8;
    display: grid;
    place-items: center;
    padding: 4vh 4vw;
    background: rgba(10, 10, 10, 0.72);
    backdrop-filter: blur(8px);
  }

  .sheet {
    display: grid;
    grid-template-columns: minmax(220px, 320px) 1fr;
    gap: 1.5rem;
    width: min(1100px, 100%);
    max-height: 88vh;
    overflow: auto;
  }

  .meta h2 {
    margin: 0.4rem 0 1rem;
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(1rem, 2.4vw, 1.6rem);
    line-height: 1.4;
  }

  .year {
    color: var(--cyan);
    font-family: 'Press Start 2P', monospace;
    font-size: 0.7rem;
  }

  .blurb {
    font-size: 1.4rem;
    line-height: 1.35;
    color: #ddd;
  }

  .ghost {
    margin-top: 1.5rem;
    border: 1px solid var(--cyan);
    background: transparent;
    color: var(--cyan);
    padding: 0.7rem 0.9rem;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.55rem;
  }

  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    grid-auto-rows: 140px;
    gap: 0.7rem;
  }

  .cell {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.8rem;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.55rem;
    line-height: 1.4;
  }

  .cell:nth-child(3n) {
    grid-row: span 2;
  }

  .over {
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.78);
    z-index: 9;
  }

  .over p {
    font-family: 'Press Start 2P', monospace;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .over button {
    margin: 1.5rem auto 0;
    border: 0;
    background: var(--cyan);
    color: #111;
    padding: 0.9rem 1.2rem;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.7rem;
  }

  @keyframes drift {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(8px, -10px);
    }
  }

  @media (max-width: 800px) {
    .sheet {
      grid-template-columns: 1fr;
    }

    .title {
      font-size: 1.1rem;
    }

    .hud {
      font-size: 0.45rem;
    }
  }
</style>
