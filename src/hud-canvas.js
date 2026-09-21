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

  const dust = Array.from({ length: 80 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.4 + 0.2,
    v: Math.random() * 0.22 + 0.04,
    a: Math.random() * Math.PI * 2,
  }));

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

  function tick(now) {
    state.t = now;
    state.amp += (state.targetAmp - state.amp) * 0.08;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    const g = ctx.createRadialGradient(
      innerWidth / 2,
      innerHeight / 2,
      20,
      innerWidth / 2,
      innerHeight / 2,
      innerWidth * 0.55
    );
    g.addColorStop(0, `rgba(92,225,255,${0.05 + state.amp * 0.08})`);
    g.addColorStop(1, "rgba(2,3,8,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    ctx.strokeStyle = "rgba(92,225,255,0.04)";
    ctx.beginPath();
    for (let x = 0; x < innerWidth; x += 56) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(92,225,255,0.45)";
    for (const p of dust) {
      p.y -= p.v;
      p.x += Math.sin(p.a + now * 0.0008) * 0.12;
      if (p.y < 0) {
        p.y = innerHeight;
        p.x = Math.random() * innerWidth;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    ring(cx, cy, 130 + state.amp * 18, now / 3000, [4, 10], `rgba(92,225,255,${0.12 + state.amp * 0.25})`);
    ring(cx, cy, 168, -now / 4000, [16, 12], `rgba(224,178,90,${0.12 + state.amp * 0.2})`);

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    setAmp(v) {
      state.targetAmp = Math.max(0, Math.min(1, v));
    },
  };
}
