/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * InfiniteMenu — React Bits (TypeScript port)
 * https://reactbits.dev/components/infinite-menu
 * Dependencies: gl-matrix
 *
 * Extra prop added: onLinkClick(link) — called instead of window.open for
 * internal anchor links, so NavBar can close the overlay & scroll cleanly.
 */

import { useEffect, useRef, useState } from "react";
import { mat4, quat, vec2, vec3 } from "gl-matrix";
import "./InfiniteMenu.css";

/* ── GLSL shaders ──────────────────────────────────────────────────── */
const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
#define PI 3.141593
void main() {
  vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
  vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
  float radius = length(centerPos.xyz);
  if (gl_VertexID > 0) {
    vec3 rotationAxis = uRotationAxisVelocity.xyz;
    float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
    vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
    vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
    float strength = dot(stretchDir, relativeVertexPos);
    float invAbsStrength = min(0., abs(strength) - 1.);
    strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
    worldPosition.xyz += stretchDir * strength;
  }
  worldPosition.xyz = radius * normalize(worldPosition.xyz);
  gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
  vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
  vUvs = aModelUvs;
  vInstanceId = gl_InstanceID;
}`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
  int itemIndex = vInstanceId % uItemCount;
  int cellsPerRow = uAtlasSize;
  int cellX = itemIndex % cellsPerRow;
  int cellY = itemIndex / cellsPerRow;
  vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
  vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
  ivec2 texSize = textureSize(uTex, 0);
  float imageAspect = float(texSize.x) / float(texSize.y);
  float containerAspect = 1.0;
  float scale = max(imageAspect / containerAspect, containerAspect / imageAspect);
  vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
  st = (st - 0.5) * scale + 0.5;
  st = clamp(st, 0.0, 1.0);
  st = st * cellSize + cellOffset;
  outColor = texture(uTex, st);
  outColor.a *= vAlpha;
}`;

/* ── Geometry helpers ─────────────────────────────────────────────── */
class Face { constructor(public a: number, public b: number, public c: number) {} }

class Vertex {
  position: vec3; normal: vec3; uv: vec2;
  constructor(x: number, y: number, z: number) {
    this.position = vec3.fromValues(x, y, z);
    this.normal   = vec3.create();
    this.uv       = vec2.create();
  }
}

class Geometry {
  vertices: Vertex[] = [];
  faces: Face[] = [];

  addVertex(...args: number[]) {
    for (let i = 0; i < args.length; i += 3)
      this.vertices.push(new Vertex(args[i], args[i+1], args[i+2]));
    return this;
  }

  addFace(...args: number[]) {
    for (let i = 0; i < args.length; i += 3)
      this.faces.push(new Face(args[i], args[i+1], args[i+2]));
    return this;
  }

  get lastVertex() { return this.vertices[this.vertices.length - 1]; }

  subdivide(divisions = 1) {
    const cache: Record<string, number> = {};
    let f = this.faces;
    for (let div = 0; div < divisions; div++) {
      const nf = new Array<Face>(f.length * 4);
      f.forEach((face, ndx) => {
        const mAB = this.getMidPoint(face.a, face.b, cache);
        const mBC = this.getMidPoint(face.b, face.c, cache);
        const mCA = this.getMidPoint(face.c, face.a, cache);
        const i = ndx * 4;
        nf[i]   = new Face(face.a, mAB, mCA);
        nf[i+1] = new Face(face.b, mBC, mAB);
        nf[i+2] = new Face(face.c, mCA, mBC);
        nf[i+3] = new Face(mAB, mBC, mCA);
      });
      f = nf;
    }
    this.faces = f;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach(v => {
      vec3.normalize(v.normal, v.position);
      vec3.scale(v.position, v.normal, radius);
    });
    return this;
  }

  getMidPoint(a: number, b: number, cache: Record<string, number>) {
    const key = a < b ? `k_${b}_${a}` : `k_${a}_${b}`;
    if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
    const va = this.vertices[a].position, vb = this.vertices[b].position;
    const ndx = this.vertices.length;
    cache[key] = ndx;
    this.addVertex((va[0]+vb[0])*.5, (va[1]+vb[1])*.5, (va[2]+vb[2])*.5);
    return ndx;
  }

  get vertexData() { return new Float32Array(this.vertices.flatMap(v => Array.from(v.position))); }
  get normalData()  { return new Float32Array(this.vertices.flatMap(v => Array.from(v.normal))); }
  get uvData()      { return new Float32Array(this.vertices.flatMap(v => Array.from(v.uv))); }
  get indexData()   { return new Uint16Array(this.faces.flatMap(f => [f.a, f.b, f.c])); }
  get data() { return { vertices: this.vertexData, indices: this.indexData, normals: this.normalData, uvs: this.uvData }; }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * .5 + .5;
    this.addVertex(-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1)
        .addFace(0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1);
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 4, radius = 1) {
    super();
    steps = Math.max(4, steps);
    const alpha = (2 * Math.PI) / steps;
    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = .5; this.lastVertex.uv[1] = .5;
    for (let i = 0; i < steps; i++) {
      const x = Math.cos(alpha * i), y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * .5 + .5;
      this.lastVertex.uv[1] = y * .5 + .5;
      if (i > 0) this.addFace(0, i, i + 1);
    }
    this.addFace(0, steps, 1);
  }
}

/* ── WebGL helpers ────────────────────────────────────────────────── */
function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext, shaderSources: string[], attribLocations?: Record<string, number>) {
  const program = gl.createProgram()!;
  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const sh = createShader(gl, type, shaderSources[ndx]);
    if (sh) gl.attachShader(program, sh);
  });
  if (attribLocations) {
    for (const attrib in attribLocations)
      gl.bindAttribLocation(program, attribLocations[attrib], attrib);
  }
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeVertexArray(gl: WebGL2RenderingContext, bufLocNumElmPairs: [WebGLBuffer, number, number][], indices?: ArrayLike<number>) {
  const va = gl.createVertexArray()!;
  gl.bindVertexArray(va);
  for (const [buffer, loc, numElem] of bufLocNumElmPairs) {
    if (loc === -1) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, numElem, gl.FLOAT, false, 0, 0);
  }
  if (indices) {
    const ib = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices as number[]), gl.STATIC_DRAW);
  }
  gl.bindVertexArray(null);
  return va;
}

function makeBuffer(gl: WebGL2RenderingContext, sizeOrData: BufferSource | number, usage: number) {
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData as BufferSource, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buf;
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio);
  const dw = Math.round(canvas.clientWidth  * dpr);
  const dh = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== dw || canvas.height !== dh) {
    canvas.width = dw; canvas.height = dh;
    return true;
  }
  return false;
}

function createAndSetupTexture(gl: WebGL2RenderingContext, minF: number, magF: number, wS: number, wT: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minF);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magF);
  return tex;
}

/* ── ArcballControl ───────────────────────────────────────────────── */
class ArcballControl {
  isPointerDown = false;
  orientation   = quat.create();
  pointerRotation = quat.create();
  rotationVelocity = 0;
  rotationAxis   = vec3.fromValues(1, 0, 0);
  snapDirection  = vec3.fromValues(0, 0, -1);
  snapTargetDirection?: vec3;

  private readonly EPSILON = 0.1;
  private readonly IDENTITY_QUAT = quat.create();
  private pointerPos: vec2;
  private previousPointerPos: vec2;
  private _rotationVelocity = 0;
  private _combinedQuat = quat.create();

  constructor(private canvas: HTMLCanvasElement, private updateCallback: (dt: number) => void) {
    this.pointerPos         = vec2.create();
    this.previousPointerPos = vec2.create();

    canvas.addEventListener("pointerdown", e => {
      vec2.set(this.pointerPos, e.clientX, e.clientY);
      vec2.copy(this.previousPointerPos, this.pointerPos);
      this.isPointerDown = true;
    });
    canvas.addEventListener("pointerup",    () => { this.isPointerDown = false; });
    canvas.addEventListener("pointerleave", () => { this.isPointerDown = false; });
    canvas.addEventListener("pointermove",  e => { if (this.isPointerDown) vec2.set(this.pointerPos, e.clientX, e.clientY); });
    canvas.style.touchAction = "none";
  }

  update(deltaTime: number, targetFrameDuration = 16) {
    const ts = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = ts;
    const snapRotation = quat.create();

    if (this.isPointerDown) {
      const INTENSITY = 0.3 * ts;
      const ANGLE_AMP = 5 / ts;
      const mid = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos);
      vec2.scale(mid, mid, INTENSITY);
      if (vec2.sqrLen(mid) > this.EPSILON) {
        vec2.add(mid, this.previousPointerPos, mid);
        const p = this.#project(mid), q = this.#project(this.previousPointerPos);
        const a = vec3.normalize(vec3.create(), p), b = vec3.normalize(vec3.create(), q);
        vec2.copy(this.previousPointerPos, mid);
        angleFactor *= ANGLE_AMP;
        this.quatFromVectors(a, b, this.pointerRotation, angleFactor);
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, INTENSITY);
      }
    } else {
      quat.slerp(this.pointerRotation, this.pointerRotation, this.IDENTITY_QUAT, 0.1 * ts);
      if (this.snapTargetDirection) {
        const sqrDist = vec3.squaredDistance(this.snapTargetDirection, this.snapDirection);
        const distFactor = Math.max(0.1, 1 - sqrDist * 10);
        angleFactor *= 0.2 * distFactor;
        this.quatFromVectors(this.snapTargetDirection, this.snapDirection, snapRotation, angleFactor);
      }
    }

    const combined = quat.multiply(quat.create(), snapRotation, this.pointerRotation);
    this.orientation = quat.multiply(quat.create(), combined, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    quat.slerp(this._combinedQuat, this._combinedQuat, combined, 0.8 * ts);
    quat.normalize(this._combinedQuat, this._combinedQuat);

    const rad = Math.acos(this._combinedQuat[3]) * 2;
    const s   = Math.sin(rad / 2);
    let rv = 0;
    if (s > 0.000001) {
      rv = rad / (2 * Math.PI);
      this.rotationAxis[0] = this._combinedQuat[0] / s;
      this.rotationAxis[1] = this._combinedQuat[1] / s;
      this.rotationAxis[2] = this._combinedQuat[2] / s;
    }
    this._rotationVelocity += (rv - this._rotationVelocity) * (0.5 * ts);
    this.rotationVelocity = this._rotationVelocity / ts;

    this.updateCallback(deltaTime);
  }

  quatFromVectors(a: vec3, b: vec3, out: quat, angleFactor = 1) {
    const axis  = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, b));
    const d     = Math.max(-1, Math.min(1, vec3.dot(a, b)));
    const angle = Math.acos(d) * angleFactor;
    quat.setAxisAngle(out, axis, angle);
    return { q: out, axis, angle };
  }

  #project(pos: vec2): vec3 {
    const r = 2, w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const s = Math.max(w, h) - 1;
    const x = (2 * pos[0] - w - 1) / s;
    const y = (2 * pos[1] - h - 1) / s;
    const xySq = x*x + y*y, rSq = r*r;
    const z = xySq <= rSq / 2 ? Math.sqrt(rSq - xySq) : rSq / Math.sqrt(xySq);
    return vec3.fromValues(-x, y, z);
  }
}

/* ── InfiniteGridMenu (WebGL engine) ──────────────────────────────── */
interface MenuItem { image: string; link: string; title: string; description: string; }

class InfiniteGridMenu {
  private static TARGET_FD = 1000 / 60;
  private static SPHERE_R  = 2;

  private gl!: WebGL2RenderingContext;
  private discProgram!: WebGLProgram;
  private discLocations: Record<string, any> = {};
  private discGeo!: DiscGeometry;
  private discVAO!: WebGLVertexArrayObject;
  private discBuffers: any;
  private discInstances: any;
  private icoGeo!: IcosahedronGeometry;
  private instancePositions!: vec3[];
  private DISC_INSTANCE_COUNT!: number;
  private worldMatrix!: mat4;
  private tex!: WebGLTexture;
  private atlasSize!: number;
  private control!: ArcballControl;
  private viewportSize!: vec2;
  private smoothRotationVelocity = 0;
  private movementActive = false;
  private scaleFactor: number;

  private camera = {
    matrix: mat4.create(), near: 0.1, far: 40,
    fov: Math.PI / 4, aspect: 1,
    position: vec3.fromValues(0, 0, 3),
    up: vec3.fromValues(0, 1, 0),
    matrices: { view: mat4.create(), projection: mat4.create(), inversProjection: mat4.create() },
  };

  private time = 0; private deltaTime = 0; private deltaFrames = 0; private frames = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private items: MenuItem[],
    private onActiveItemChange: (i: number) => void,
    private onMovementChange: (moving: boolean) => void,
    onInit: ((sk: InfiniteGridMenu) => void) | null = null,
    scale = 1.0,
  ) {
    this.scaleFactor = scale;
    this.camera.position[2] = 3 * scale;
    this.init(onInit);
  }

  resize() {
    this.viewportSize = vec2.set(this.viewportSize || vec2.create(), this.canvas.clientWidth, this.canvas.clientHeight);
    const gl = this.gl;
    if (resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement))
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    this.updateProjectionMatrix(gl);
  }

  run(time = 0) {
    this.deltaTime   = Math.min(32, time - this.time);
    this.time        = time;
    this.deltaFrames = this.deltaTime / InfiniteGridMenu.TARGET_FD;
    this.frames     += this.deltaFrames;
    this.animate(this.deltaTime);
    this.renderFrame();
    requestAnimationFrame(t => this.run(t));
  }

  private init(onInit: ((sk: InfiniteGridMenu) => void) | null) {
    const gl = this.canvas.getContext("webgl2", { antialias: true, alpha: true })!;
    this.gl = gl;
    if (!gl) throw new Error("No WebGL2 context!");

    this.viewportSize = vec2.fromValues(this.canvas.clientWidth, this.canvas.clientHeight);

    this.discProgram = createProgram(gl, [discVertShaderSource, discFragShaderSource], {
      aModelPosition: 0, aModelNormal: 1, aModelUvs: 2, aInstanceMatrix: 3,
    })!;

    this.discLocations = {
      aModelPosition:          gl.getAttribLocation(this.discProgram,  "aModelPosition"),
      aModelUvs:               gl.getAttribLocation(this.discProgram,  "aModelUvs"),
      aInstanceMatrix:         gl.getAttribLocation(this.discProgram,  "aInstanceMatrix"),
      uWorldMatrix:            gl.getUniformLocation(this.discProgram, "uWorldMatrix"),
      uViewMatrix:             gl.getUniformLocation(this.discProgram, "uViewMatrix"),
      uProjectionMatrix:       gl.getUniformLocation(this.discProgram, "uProjectionMatrix"),
      uCameraPosition:         gl.getUniformLocation(this.discProgram, "uCameraPosition"),
      uRotationAxisVelocity:   gl.getUniformLocation(this.discProgram, "uRotationAxisVelocity"),
      uTex:                    gl.getUniformLocation(this.discProgram, "uTex"),
      uFrames:                 gl.getUniformLocation(this.discProgram, "uFrames"),
      uItemCount:              gl.getUniformLocation(this.discProgram, "uItemCount"),
      uAtlasSize:              gl.getUniformLocation(this.discProgram, "uAtlasSize"),
    };

    this.discGeo     = new DiscGeometry(56, 1);
    this.discBuffers = this.discGeo.data;
    this.discVAO     = makeVertexArray(
      gl,
      [
        [makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW), this.discLocations.aModelPosition, 3],
        [makeBuffer(gl, this.discBuffers.uvs,      gl.STATIC_DRAW), this.discLocations.aModelUvs,      2],
      ],
      this.discBuffers.indices,
    )!;

    this.icoGeo = new IcosahedronGeometry();
    this.icoGeo.subdivide(1).spherize(InfiniteGridMenu.SPHERE_R);
    this.instancePositions     = this.icoGeo.vertices.map(v => v.position);
    this.DISC_INSTANCE_COUNT   = this.icoGeo.vertices.length;
    this.initDiscInstances(this.DISC_INSTANCE_COUNT);
    this.worldMatrix = mat4.create();
    this.initTexture();

    this.control = new ArcballControl(this.canvas, dt => this.onControlUpdate(dt));
    this.updateCameraMatrix();
    this.updateProjectionMatrix(gl);
    this.resize();

    if (onInit) onInit(this);
  }

  private initTexture() {
    const gl = this.gl;
    this.tex = createAndSetupTexture(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    const itemCount = Math.max(1, this.items.length);
    this.atlasSize  = Math.ceil(Math.sqrt(itemCount));
    const canvas    = document.createElement("canvas");
    const ctx       = canvas.getContext("2d")!;
    const cellSize  = 512;
    canvas.width    = this.atlasSize * cellSize;
    canvas.height   = this.atlasSize * cellSize;

    Promise.all(this.items.map(item => new Promise<HTMLImageElement>(resolve => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload = () => resolve(img); img.src = item.image;
    }))).then(images => {
      images.forEach((img, i) => {
        ctx.drawImage(img, (i % this.atlasSize) * cellSize, Math.floor(i / this.atlasSize) * cellSize, cellSize, cellSize);
      });
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  private initDiscInstances(count: number) {
    const gl = this.gl;
    this.discInstances = { matricesArray: new Float32Array(count * 16), matrices: [], buffer: gl.createBuffer() };
    for (let i = 0; i < count; i++) {
      const arr = new Float32Array(this.discInstances.matricesArray.buffer, i * 16 * 4, 16);
      arr.set(mat4.create());
      this.discInstances.matrices.push(arr);
    }
    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
    const bytesPerMatrix = 16 * 4;
    for (let j = 0; j < 4; j++) {
      const loc = this.discLocations.aInstanceMatrix + j;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, j * 4 * 4);
      gl.vertexAttribDivisor(loc, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  private animate(deltaTime: number) {
    const gl = this.gl;
    this.control.update(deltaTime, InfiniteGridMenu.TARGET_FD);
    const scale = 0.25, SI = 0.6;
    this.instancePositions.map(p => vec3.transformQuat(vec3.create(), p, this.control.orientation)).forEach((p, ndx) => {
      const s = (Math.abs(p[2]) / InfiniteGridMenu.SPHERE_R) * SI + (1 - SI);
      const fs = s * scale;
      const m = mat4.create();
      mat4.multiply(m, m, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), p)));
      mat4.multiply(m, m, mat4.targetTo(mat4.create(), [0,0,0], p, [0,1,0]));
      mat4.multiply(m, m, mat4.fromScaling(mat4.create(), [fs, fs, fs]));
      mat4.multiply(m, m, mat4.fromTranslation(mat4.create(), [0, 0, -InfiniteGridMenu.SPHERE_R]));
      mat4.copy(this.discInstances.matrices[ndx], m);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.smoothRotationVelocity = this.control.rotationVelocity;
  }

  private renderFrame() {
    const gl = this.gl;
    gl.useProgram(this.discProgram);
    gl.enable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix,      false, this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix,       false, this.camera.matrices.view);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix, false, this.camera.matrices.projection);
    gl.uniform3f(this.discLocations.uCameraPosition, ...this.camera.position as [number,number,number]);
    gl.uniform4f(this.discLocations.uRotationAxisVelocity,
      this.control.rotationAxis[0], this.control.rotationAxis[1],
      this.control.rotationAxis[2], this.smoothRotationVelocity * 1.1);
    gl.uniform1i(this.discLocations.uItemCount,  this.items.length);
    gl.uniform1i(this.discLocations.uAtlasSize,  this.atlasSize);
    gl.uniform1f(this.discLocations.uFrames,     this.frames);
    gl.uniform1i(this.discLocations.uTex,        0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, this.discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, this.DISC_INSTANCE_COUNT);
  }

  private updateCameraMatrix() {
    mat4.targetTo(this.camera.matrix, this.camera.position, [0,0,0], this.camera.up);
    mat4.invert(this.camera.matrices.view, this.camera.matrix);
  }

  private updateProjectionMatrix(gl: WebGL2RenderingContext) {
    this.camera.aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight;
    const height = InfiniteGridMenu.SPHERE_R * .35, dist = this.camera.position[2];
    this.camera.fov = this.camera.aspect > 1
      ? 2 * Math.atan(height / dist)
      : 2 * Math.atan(height / this.camera.aspect / dist);
    mat4.perspective(this.camera.matrices.projection, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far);
    mat4.invert(this.camera.matrices.inversProjection, this.camera.matrices.projection);
  }

  private onControlUpdate(deltaTime: number) {
    const ts = deltaTime / InfiniteGridMenu.TARGET_FD + 0.0001;
    let cameraTargetZ = 3 * this.scaleFactor;
    const isMoving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;
    if (isMoving !== this.movementActive) { this.movementActive = isMoving; this.onMovementChange(isMoving); }

    if (!this.control.isPointerDown) {
      const ni = this.findNearestVertexIndex();
      this.onActiveItemChange(ni % Math.max(1, this.items.length));
      this.control.snapTargetDirection = vec3.normalize(vec3.create(), this.getVertexWorldPosition(ni));
    } else {
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5;
    }
    this.camera.position[2] += (cameraTargetZ - this.camera.position[2]) / (5 / ts);
    this.updateCameraMatrix();
  }

  private findNearestVertexIndex() {
    const iq = quat.conjugate(quat.create(), this.control.orientation);
    const nt = vec3.transformQuat(vec3.create(), this.control.snapDirection, iq);
    let maxD = -1, nearest = 0;
    this.instancePositions.forEach((p, i) => {
      const d = vec3.dot(nt, p);
      if (d > maxD) { maxD = d; nearest = i; }
    });
    return nearest;
  }

  private getVertexWorldPosition(index: number) {
    return vec3.transformQuat(vec3.create(), this.instancePositions[index], this.control.orientation);
  }
}

/* ── React component ──────────────────────────────────────────────── */
export interface InfiniteMenuItem { image: string; link: string; title: string; description: string; }

interface InfiniteMenuProps {
  items: InfiniteMenuItem[];
  scale?: number;
  /** Called with link string for non-http links (internal nav) */
  onLinkClick?: (link: string) => void;
}

const defaultItems: InfiniteMenuItem[] = [
  { image: "https://picsum.photos/seed/default/900/900", link: "#", title: "", description: "" },
];

export default function InfiniteMenu({ items = [], scale = 1.0, onLinkClick }: InfiniteMenuProps) {
  const canvasRef              = useRef<HTMLCanvasElement>(null);
  const [activeItem, setActiveItem] = useState<InfiniteMenuItem | null>(null);
  const [isMoving,   setIsMoving]   = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sketch = new InfiniteGridMenu(
      canvas,
      items.length ? items : defaultItems,
      (index) => setActiveItem((items.length ? items : defaultItems)[index % Math.max(1, (items.length ? items : defaultItems).length)]),
      setIsMoving,
      (sk) => sk.run(),
      scale,
    );

    const onResize = () => sketch.resize();
    window.addEventListener("resize", onResize);
    onResize();

    return () => window.removeEventListener("resize", onResize);
  }, [items, scale]);

  const handleButtonClick = () => {
    if (!activeItem?.link) return;
    if (activeItem.link.startsWith("http")) {
      window.open(activeItem.link, "_blank", "noopener,noreferrer");
    } else {
      onLinkClick?.(activeItem.link);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} id="infinite-grid-menu-canvas" />

      {activeItem && (
        <>
          <h2 className={`face-title ${isMoving ? "inactive" : "active"}`}>
            {activeItem.title}
          </h2>
          <p className={`face-description ${isMoving ? "inactive" : "active"}`}>
            {activeItem.description}
          </p>
          <div
            onClick={handleButtonClick}
            className={`action-button ${isMoving ? "inactive" : "active"}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleButtonClick()}
          >
            <p className="action-button-icon">&#x2197;</p>
          </div>
        </>
      )}
    </div>
  );
}
