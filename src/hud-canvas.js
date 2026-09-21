export function startHud(canvas) {
  const ctx = canvas.getContext("2d");
  const state = { amp: 0, t: 0, targetAmp: 0 };

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

  const dust = Array.from({ length: 90 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.6 + 0.2,
    v: Math.random() * 0.18 + 0.03,
    a: Math.random() * Math.PI * 2,
    g: Math.random() > 0.7,
  }));

  function drawDiamondGrid() {
    const step = 72;
    ctx.save();
    ctx.strokeStyle = "rgba(201,164,92,0.045)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -innerHeight; x < innerWidth + innerHeight; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + innerHeight, innerHeight);
      ctx.moveTo(x, 0);
      ctx.lineTo(x - innerHeight, innerHeight);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawDust() {
    for (const p of dust) {
      p.y -= p.v;
      p.x += Math.sin(p.a + state.t * 0.0007) * 0.12;
      if (p.y < -6) {
        p.y = innerHeight + 6;
        p.x = Math.random() * innerWidth;
      }
      ctx.fillStyle = p.g ? `rgba(232,213,163,${0.28 + state.amp * 0.3})` : `rgba(143,217,228,${0.12 + state.amp * 0.2})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function ring(x, y, radius, rot, dash, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function ticks(x, y, radius, count, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = "rgba(201,164,92,0.28)";
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * radius, Math.sin(a) * radius);
      ctx.lineTo(Math.cos(a) * (radius + 6), Math.sin(a) * (radius + 6));
      ctx.stroke();
    }
    ctx.restore();
  }

  function tick(now) {
    state.t = now;
    state.amp += (state.targetAmp - state.amp) * 0.06;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    const g = ctx.createRadialGradient(
      innerWidth * 0.5,
      innerHeight * 0.18,
      20,
      innerWidth * 0.5,
      innerHeight * 0.4,
      innerWidth * 0.65
    );
    g.addColorStop(0, "rgba(201,164,92,0.08)");
    g.addColorStop(0.45, "rgba(40,20,24,0.12)");
    g.addColorStop(1, "rgba(7,5,10,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    drawDiamondGrid();
    drawDust();

    const cx = innerWidth * 0.5;
    const cy = 86;
    const glow = 0.14 + state.amp * 0.35;
    ring(cx, cy, 34 + state.amp * 8, now / 4000, [2, 8], `rgba(201,164,92,${glow})`);
    ring(cx, cy, 48, -now / 5200, [12, 10], `rgba(143,217,228,${0.12 + state.amp * 0.2})`);
    ticks(cx, cy, 58, 24, now / 18000);

    const bx = innerWidth - 86;
    const by = innerHeight - 86;
    ring(bx, by, 22 + state.amp * 6, now / 1800, [4, 6], `rgba(201,164,92,${0.22 + state.amp * 0.3})`);
    ring(bx, by, 34, -now / 2600, [10, 8], `rgba(232,213,163,0.18)`);
    ctx.fillStyle = `rgba(232,213,163,${0.45 + state.amp * 0.4})`;
    ctx.beginPath();
    ctx.arc(bx, by, 3.5 + state.amp * 2, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    setAmp(v) {
      state.targetAmp = Math.max(0, Math.min(1, v));
    },
  };
}
