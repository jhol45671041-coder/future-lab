export function startHud(canvas) {
  const ctx = canvas.getContext("2d");
  const state = { amp: 0, t: 0 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.4 + 0.3,
    v: Math.random() * 0.25 + 0.05,
    a: Math.random() * Math.PI * 2,
  }));

  function drawGrid() {
    const step = 48;
    ctx.strokeStyle = "rgba(0,231,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < innerWidth; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
    }
    for (let y = 0; y < innerHeight; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(innerWidth, y);
    }
    ctx.stroke();
  }

  function drawParticles() {
    ctx.fillStyle = "rgba(0,231,255,0.55)";
    for (const p of particles) {
      p.y -= p.v;
      p.x += Math.sin(p.a + state.t * 0.001) * 0.15;
      if (p.y < -4) {
        p.y = innerHeight + 4;
        p.x = Math.random() * innerWidth;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function ring(x, y, radius, rot, dash) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = `rgba(0,231,255,${0.18 + state.amp * 0.4})`;
    ctx.lineWidth = 1.2;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function tick(now) {
    state.t = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const g = ctx.createRadialGradient(
      innerWidth * 0.5,
      innerHeight * 0.35,
      40,
      innerWidth * 0.5,
      innerHeight * 0.5,
      innerWidth * 0.7
    );
    g.addColorStop(0, "rgba(0,40,55,0.35)");
    g.addColorStop(1, "rgba(2,7,12,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    drawGrid();
    drawParticles();

    const cx = innerWidth - 70;
    const cy = innerHeight - 70;
    ring(cx, cy, 28 + state.amp * 10, now / 1800, [4, 6]);
    ring(cx, cy, 40, -now / 2400, [10, 8]);
    ring(cx, cy, 18, now / 900, null);
    ctx.fillStyle = `rgba(0,231,255,${0.55 + state.amp * 0.4})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 5 + state.amp * 3, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    setAmp(v) {
      state.amp = Math.max(0, Math.min(1, v));
    },
  };
}
