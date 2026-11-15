/* Start every visit at the closed doorway, including a reload with an old hash. */
try { history.scrollRestoration = 'manual'; } catch (_) {}
try { if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
addEventListener('pageshow', () => {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  scrollTo(0, 0);
  requestAnimationFrame(() => { root.style.scrollBehavior = previous; });
});
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion-ready');
