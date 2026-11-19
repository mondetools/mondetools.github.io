(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reducedMotion.matches) return;

  let frame = 0;
  let pointerInside = false;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  function moveGlow(event) {
    pointerInside = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (!pointerInside) return;
      document.body.style.setProperty("--cursor-x", `${pointerX}px`);
      document.body.style.setProperty("--cursor-y", `${pointerY}px`);
      document.body.classList.add("cursor-glow-active");
      const eye = document.querySelector(".hero-eye");
      if (eye) {
        const screenX = Math.max(-1, Math.min(1, (pointerX / window.innerWidth - 0.5) * 2));
        const screenY = Math.max(-1, Math.min(1, (pointerY / window.innerHeight - 0.5) * 2));
        eye.style.setProperty("--eye-follow-x", `${screenX * 48}px`);
        eye.style.setProperty("--eye-follow-y", `${screenY * 30}px`);
        const bounds = eye.getBoundingClientRect();
        const horizontal = Math.max(-1, Math.min(1, (pointerX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)));
        const vertical = Math.max(-1, Math.min(1, (pointerY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)));
        eye.style.setProperty("--iris-x", `${horizontal * 22}px`);
        eye.style.setProperty("--iris-y", `${vertical * 13}px`);
      }
    });
  }

  function hideGlow(event) {
    if (event.relatedTarget) return;
    pointerInside = false;
    document.body.classList.remove("cursor-glow-active");
    resetEye();
  }

  function resetEye() {
    const eye = document.querySelector(".hero-eye");
    if (!eye) return;
    eye.style.setProperty("--eye-follow-x", "0px");
    eye.style.setProperty("--eye-follow-y", "0px");
    eye.style.setProperty("--iris-x", "0px");
    eye.style.setProperty("--iris-y", "0px");
  }

  const actionSelector = 'a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[role="button"],[tabindex]:not([tabindex="-1"])';
  document.addEventListener("pointerover", event => {
    if (event.target instanceof Element && event.target.closest(actionSelector)) {
      document.body.classList.add("cursor-over-action");
    }
  });
  document.addEventListener("pointerout", event => {
    const next = event.relatedTarget instanceof Element ? event.relatedTarget.closest(actionSelector) : null;
    if (!next) document.body.classList.remove("cursor-over-action");
  });

  window.addEventListener("pointermove", moveGlow, { passive: true });
  window.addEventListener("pointerout", hideGlow, { passive: true });
  window.addEventListener("blur", () => {
    pointerInside = false;
    document.body.classList.remove("cursor-glow-active");
    document.body.classList.remove("cursor-over-action");
    resetEye();
  });
})();
