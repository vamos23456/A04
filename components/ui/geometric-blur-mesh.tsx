"use client";

import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_time;
uniform int u_shape;
uniform int u_theme;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.2831853071795864769252867665590

mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, s,
        0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

mat3 rotateZ(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    return p;
}

vec2 project(vec3 p) {
    float perspective = 2.0 / (2.0 - p.z);
    return p.xy * perspective;
}

float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

float drawLine(vec2 p, vec2 a, vec2 b, float thickness, float blur) {
    float d = distToSegment(p, a, b);
    return smoothstep(thickness + blur, thickness - blur, d);
}

void getCubeVertices(out vec3 v[8]) {
    float s = 0.7;
    v[0] = vec3(-s, -s, -s);
    v[1] = vec3( s, -s, -s);
    v[2] = vec3( s,  s, -s);
    v[3] = vec3(-s,  s, -s);
    v[4] = vec3(-s, -s,  s);
    v[5] = vec3( s, -s,  s);
    v[6] = vec3( s,  s,  s);
    v[7] = vec3(-s,  s,  s);
}

void getTetrahedronVertices(out vec3 v[4]) {
    float a = 1.0 / sqrt(3.0);
    v[0] = vec3( a,  a,  a);
    v[1] = vec3( a, -a, -a);
    v[2] = vec3(-a,  a, -a);
    v[3] = vec3(-a, -a,  a);
}

void getOctahedronVertices(out vec3 v[6]) {
    v[0] = vec3( 1.0,  0.0,  0.0);
    v[1] = vec3(-1.0,  0.0,  0.0);
    v[2] = vec3( 0.0,  1.0,  0.0);
    v[3] = vec3( 0.0, -1.0,  0.0);
    v[4] = vec3( 0.0,  0.0,  1.0);
    v[5] = vec3( 0.0,  0.0, -1.0);
}

void getIcosahedronVertices(out vec3 v[12]) {
    float t = (1.0 + sqrt(5.0)) / 2.0;
    float s = 1.0 / sqrt(1.0 + t * t);
    v[0] = vec3(-s, t * s, 0.0);
    v[1] = vec3( s, t * s, 0.0);
    v[2] = vec3(-s, -t * s, 0.0);
    v[3] = vec3( s, -t * s, 0.0);
    v[4] = vec3(0.0, -s, t * s);
    v[5] = vec3(0.0,  s, t * s);
    v[6] = vec3(0.0, -s, -t * s);
    v[7] = vec3(0.0,  s, -t * s);
    v[8] = vec3( t * s, 0.0, -s);
    v[9] = vec3( t * s, 0.0,  s);
    v[10] = vec3(-t * s, 0.0, -s);
    v[11] = vec3(-t * s, 0.0,  s);
}

float drawWireframe(vec2 p, int shape, mat3 rotation, float scale, float thickness, float blur) {
    float result = 0.0;

    if (shape == 0) {
        vec3 v[8];
        getCubeVertices(v);
        for (int i = 0; i < 8; i++) {
            v[i] = rotation * (v[i] * scale);
        }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[7]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[7]), thickness, blur);
    } else if (shape == 1) {
        vec3 v[4];
        getTetrahedronVertices(v);
        for (int i = 0; i < 4; i++) {
            v[i] = rotation * (v[i] * scale);
        }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
    } else if (shape == 2) {
        vec3 v[6];
        getOctahedronVertices(v);
        for (int i = 0; i < 6; i++) {
            v[i] = rotation * (v[i] * scale);
        }
        result += drawLine(p, project(v[2]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[0]), thickness, blur);
    } else if (shape == 3) {
        vec3 v[12];
        getIcosahedronVertices(v);
        for (int i = 0; i < 12; i++) {
            v[i] = rotation * (v[i] * scale);
        }
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[0]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[1]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[2]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[4]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[6]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[3]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur);
        result += drawLine(p, project(v[4]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[5]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[8]), thickness, blur);
        result += drawLine(p, project(v[6]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[7]), project(v[10]), thickness, blur);
        result += drawLine(p, project(v[8]), project(v[9]), thickness, blur);
        result += drawLine(p, project(v[9]), project(v[11]), thickness, blur);
        result += drawLine(p, project(v[10]), project(v[11]), thickness, blur);
    } else {
        vec3 cube[8];
        getCubeVertices(cube);
        vec3 octa[6];
        getOctahedronVertices(octa);
        float t = u_time * 0.5;
        float morph = sin(t) * 0.5 + 0.5;
        vec3 v[8];
        for (int i = 0; i < 8; i++) {
            if (i < 6) {
                v[i] = mix(cube[i], octa[i] * 1.5, morph);
            } else {
                v[i] = cube[i] * (1.0 - morph * 0.3);
            }
            v[i] = rotation * (v[i] * scale);
        }
        float alpha = 1.0 - morph * 0.5;
        result += drawLine(p, project(v[0]), project(v[1]), thickness, blur) * alpha;
        result += drawLine(p, project(v[1]), project(v[2]), thickness, blur) * alpha;
        result += drawLine(p, project(v[2]), project(v[3]), thickness, blur) * alpha;
        result += drawLine(p, project(v[3]), project(v[0]), thickness, blur) * alpha;
        result += drawLine(p, project(v[4]), project(v[5]), thickness, blur) * alpha;
        result += drawLine(p, project(v[5]), project(v[6]), thickness, blur) * alpha;
        result += drawLine(p, project(v[6]), project(v[7]), thickness, blur) * alpha;
        result += drawLine(p, project(v[7]), project(v[4]), thickness, blur) * alpha;
        result += drawLine(p, project(v[0]), project(v[6]), thickness, blur) * morph;
        result += drawLine(p, project(v[1]), project(v[7]), thickness, blur) * morph;
        result += drawLine(p, project(v[2]), project(v[4]), thickness, blur) * morph;
        result += drawLine(p, project(v[3]), project(v[5]), thickness, blur) * morph;
    }

    return clamp(result, 0.0, 1.0);
}

vec3 render(vec2 st, vec2 mouse) {
    float mouseDistance = length(st - mouse);
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseDistance);
    float time = u_time * 0.2;

    mat3 rotation = rotateY(time + (mouse.x - 0.5) * mouseInfluence * 1.0) *
                    rotateX(time * 0.7 + (mouse.y - 0.5) * mouseInfluence * 1.0) *
                    rotateZ(time * 0.1);

    float scale = 0.35;
    float blur = mix(0.0001, 0.05, mouseInfluence);
    float thickness = mix(0.002, 0.003, mouseInfluence);
    float shape = drawWireframe(st, u_shape, rotation, scale, thickness, blur);

    vec3 color;
    if (u_theme == 0) {
        float sweep = atan(st.y, st.x) / TWO_PI + 0.5 + u_time * 0.04;
        vec3 violet = vec3(0.42, 0.36, 1.0);
        vec3 pink = vec3(1.0, 0.35, 0.8);
        vec3 cyan = vec3(0.36, 0.86, 1.0);
        color = mix(violet, pink, smoothstep(0.12, 0.68, fract(sweep)));
        color = mix(color, cyan, smoothstep(0.52, 0.98, fract(sweep + 0.18)));
        color += vec3(0.08, 0.05, 0.12);
    } else {
        color = vec3(0.08, 0.08, 0.1);
    }
    float dimming = 1.0 - mouseInfluence * 0.3;
    color *= shape * dimming;
    float vignette = 1.0 - length(st) * 0.2;
    color *= vignette;
    color = pow(color, vec3(0.9));
    return color;
}

void main() {
    vec2 st = coord(gl_FragCoord.xy);
    vec2 mouse = coord(u_mouse * u_pixelRatio) * vec2(1.0, -1.0);
    vec3 color = render(st, mouse);
    gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
attribute vec3 a_position;
attribute vec2 a_uv;
varying vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_position, 1.0);
    v_texcoord = a_uv;
}
`;

const shapes = ["Cube", "Tetrahedron", "Octahedron", "Icosahedron", "Morphing"];

export function GeometricBlurMesh({
  className,
  interactive = true,
  showOverlay = true,
  showLabel = true,
  theme = "dark",
}: {
  className?: string;
  interactive?: boolean;
  showOverlay?: boolean;
  showLabel?: boolean;
  theme?: "dark" | "light";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseDampRef = useRef({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const startTimeRef = useRef(Date.now());
  const themeValue = theme === "dark" ? 0 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) return;

    glRef.current = gl;
    gl.clearColor(0, 0, 0, 0);

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vShader = createShader(gl.VERTEX_SHADER, vertexShader);
    const fShader = createShader(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    programRef.current = program;
    gl.useProgram(program);

    uniformsRef.current = {
      u_mouse: gl.getUniformLocation(program, "u_mouse"),
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_pixelRatio: gl.getUniformLocation(program, "u_pixelRatio"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_shape: gl.getUniformLocation(program, "u_shape"),
      u_theme: gl.getUniformLocation(program, "u_theme"),
    };

    const vertices = new Float32Array([
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
       1,  1, 0,
    ]);

    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const uvLocation = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vShader);
      gl.deleteShader(fShader);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const gl = glRef.current;
      if (!canvas || !container || !gl) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      const canvas = canvasRef.current;
      const gl = glRef.current;
      if (!canvas || !gl) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      mouseDampRef.current.x += (mouseRef.current.x - mouseDampRef.current.x) * 8 * deltaTime;
      mouseDampRef.current.y += (mouseRef.current.y - mouseDampRef.current.y) * 8 * deltaTime;

      gl.clear(gl.COLOR_BUFFER_BIT);

      const dpr = Math.min(window.devicePixelRatio, 2);
      const elapsedTime = (Date.now() - startTimeRef.current) / 1000;

      if (uniformsRef.current.u_mouse) {
        gl.uniform2f(uniformsRef.current.u_mouse, mouseDampRef.current.x, mouseDampRef.current.y);
      }
      if (uniformsRef.current.u_resolution) {
        gl.uniform2f(uniformsRef.current.u_resolution, canvas.width, canvas.height);
      }
      if (uniformsRef.current.u_pixelRatio) {
        gl.uniform1f(uniformsRef.current.u_pixelRatio, dpr);
      }
      if (uniformsRef.current.u_time) {
        gl.uniform1f(uniformsRef.current.u_time, elapsedTime);
      }
      if (uniformsRef.current.u_shape) {
        gl.uniform1i(uniformsRef.current.u_shape, currentShape);
      }
      if (uniformsRef.current.u_theme) {
        gl.uniform1i(uniformsRef.current.u_theme, themeValue);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentShape, themeValue]);

  return (
    <div
      ref={containerRef}
      onClick={interactive ? () => setCurrentShape((prev) => (prev + 1) % shapes.length) : undefined}
      onMouseMove={interactive ? (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      } : undefined}
      className={cn(
        "group relative overflow-hidden rounded-[30px]",
        interactive ? "cursor-pointer" : "pointer-events-none",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full",
          theme === "dark"
            ? "opacity-100 saturate-150 [filter:drop-shadow(0_0_20px_rgba(90,80,255,0.5))_drop-shadow(0_0_28px_rgba(255,88,204,0.34))]"
            : "opacity-95"
        )}
      />
      {showOverlay ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_18%_28%,rgba(103,87,255,0.28),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(255,92,198,0.24),transparent_36%),radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_40%)]"
              : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%)]"
          )}
        />
      ) : null}
      {showLabel ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5">
          <div>
            <p className={cn("text-[10px] uppercase tracking-[0.24em]", theme === "dark" ? "text-white/38" : "text-black/36")}>Interactive Mesh</p>
            <p className={cn("mt-2 text-sm", theme === "dark" ? "text-white/62" : "text-black/62")}>{shapes[currentShape]}</p>
          </div>
          <p className={cn("text-[10px] uppercase tracking-[0.22em] transition-opacity duration-300", theme === "dark" ? "text-white/24 group-hover:opacity-100" : "text-black/24 group-hover:opacity-100")}>
            Click To Switch
          </p>
        </div>
      ) : null}
    </div>
  );
}
