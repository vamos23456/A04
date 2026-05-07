import { useEffect, useRef } from 'react';

type InkPoint = {
  x: number;
  y: number;
  px: number;
  py: number;
  nx: number;
  ny: number;
  life: number;
  weight: number;
  spread: number;
  widthScale: number;
};

export default function P5PaperBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const { default: p5 } = await import('p5');
      if (!mounted || !containerRef.current) return;

      const sketch = (p: p5) => {
        let lastMouse = { x: -1, y: -1, active: false };
        const marks: InkPoint[] = [];

        const addInk = (x: number, y: number) => {
          if (!lastMouse.active) {
            lastMouse = { x, y, active: true };
          }

          const dx = x - lastMouse.x;
          const dy = y - lastMouse.y;
          const distance = Math.hypot(dx, dy);
          const steps = Math.max(1, Math.ceil(distance / 7));

          for (let i = 1; i <= steps; i += 1) {
            const t = i / steps;
            const ix = p.lerp(lastMouse.x, x, t) + p.random(-4, 4);
            const iy = p.lerp(lastMouse.y, y, t) + p.random(-4, 4);
            marks.push({
              x: ix,
              y: iy,
              px: p.lerp(lastMouse.x, x, Math.max(0, t - 1 / steps)),
              py: p.lerp(lastMouse.y, y, Math.max(0, t - 1 / steps)),
              nx: x,
              ny: y,
              life: 1,
              weight: p.random(24, 42),
              spread: p.random(10, 20),
              widthScale: p.random(0.88, 1.12),
            });
          }

          lastMouse = { x, y, active: true };
        };

        const drawMark = (mark: InkPoint) => {
          const dx = mark.x - mark.px;
          const dy = mark.y - mark.py;
          const distance = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx || 0.0001);
          const nextAngle = Math.atan2(mark.ny - mark.y, mark.nx - mark.x || 0.0001);
          const normalX = Math.cos(angle + Math.PI / 2);
          const normalY = Math.sin(angle + Math.PI / 2);
          const nextNormalX = Math.cos(nextAngle + Math.PI / 2);
          const nextNormalY = Math.sin(nextAngle + Math.PI / 2);
          const width = mark.weight * mark.widthScale;
          const nextWidth = width * 0.84;

          p.push();
          p.noStroke();
          p.fill(18, 18, 18, mark.life * 40);
          p.beginShape();
          p.vertex(mark.px + normalX * width * 0.48, mark.py + normalY * width * 0.48);
          p.vertex(mark.x + nextNormalX * nextWidth * 0.52, mark.y + nextNormalY * nextWidth * 0.52);
          p.vertex(mark.x - nextNormalX * nextWidth * 0.52, mark.y - nextNormalY * nextWidth * 0.52);
          p.vertex(mark.px - normalX * width * 0.48, mark.py - normalY * width * 0.48);
          p.endShape(p.CLOSE);

          p.fill(18, 18, 18, mark.life * 18);
          p.ellipse(mark.px, mark.py, width * 0.92, width * 0.86);
          p.ellipse(mark.x, mark.y, nextWidth * 0.96, nextWidth * 0.82);

          p.strokeCap(p.ROUND);
          p.strokeJoin(p.ROUND);
          p.stroke(18, 18, 18, mark.life * 20);
          p.strokeWeight(width * 0.78);
          p.line(mark.px, mark.py, mark.x, mark.y);

          p.noStroke();
          p.fill(18, 18, 18, mark.life * 12);
          p.ellipse(
            (mark.px + mark.x) / 2 + normalX * mark.spread * 0.12,
            (mark.py + mark.y) / 2 + normalY * mark.spread * 0.12,
            width * 1.65 + distance * 1.1,
            width * 0.92
          );
          p.pop();
        };

        const resize = () => {
          if (!containerRef.current) return;
          p.resizeCanvas(containerRef.current.clientWidth, containerRef.current.clientHeight);
          lastMouse = { x: -1, y: -1, active: false };
          marks.length = 0;
        };

        p.setup = () => {
          const canvas = p.createCanvas(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
          canvas.parent(containerRef.current!);
          canvas.style('pointer-events', 'none');
          p.clear();
        };

        p.draw = () => {
          p.clear();

          for (let i = marks.length - 1; i >= 0; i -= 1) {
            const mark = marks[i];
            drawMark(mark);
            mark.life *= 0.94;
            if (mark.life < 0.03) {
              marks.splice(i, 1);
            }
          }
        };

        p.windowResized = resize;

        p.mouseMoved = (event?: MouseEvent) => {
          if (!event) return;
          addInk(event.clientX, event.clientY);
        };

        p.mouseDragged = (event?: MouseEvent) => {
          if (!event) return;
          addInk(event.clientX, event.clientY);
        };

        p.mouseOut = () => {
          lastMouse = { x: -1, y: -1, active: false };
        };
      };

      const instance = new p5(sketch);
      cleanup = () => instance.remove();
    };

    boot();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
