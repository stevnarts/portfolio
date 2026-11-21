"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const bodies = [
  { id: "mercury", tilt: 0.1, speed: .092, anchor: [.08, .67], distantRadius: .018 },
  { id: "venus", tilt: 177, speed: .060, anchor: [.50, .17], distantRadius: .025 },
  { id: "earth", tilt: 23.4, speed: .075, anchor: [.89, .20], distantRadius: .030 },
  { id: "mars", tilt: 25.2, speed: .087, anchor: [.95, .65], distantRadius: .021 },
  { id: "jupiter", tilt: 3.1, speed: .108, anchor: [.09, .83], distantRadius: .043 },
  { id: "saturn", tilt: 26.7, speed: .097, anchor: [.51, .79], distantRadius: .035 },
  { id: "uranus", tilt: 97.8, speed: .061, anchor: [.28, .12], distantRadius: .026 },
  { id: "neptune", tilt: 28.3, speed: .065, anchor: [.89, .85], distantRadius: .025 },
];

const vert = `
  varying vec2 atlasUv;
  varying vec3 surfaceNormal;
  varying vec3 viewDirection;
  void main() {
    atlasUv = uv;
    surfaceNormal = normalMatrix * normal;
    vec4 point = modelViewMatrix * vec4(position, 1.);
    viewDirection = -point.xyz;
    gl_Position = projectionMatrix * point;
  }`;

const frag = `
  uniform sampler2D atlas;
  uniform float focus;
  uniform float hover;
  uniform float phase;
  uniform vec3 glintNormal;
  varying vec2 atlasUv;
  varying vec3 surfaceNormal;
  varying vec3 viewDirection;
  void main(){
    vec3 n = normalize(surfaceNormal);
    vec3 eye = normalize(viewDirection);
    vec3 key = normalize(vec3(-.77, .54, .64));
    float sun = dot(n, key);
    float rim = pow(1.-clamp(dot(n,eye), 0., 1.), 2.7);
    vec3 pigment = texture2D(atlas, atlasUv).rgb;
    vec3 light = mix(vec3(.20,.25,.39), vec3(1.26,1.17,1.05), smoothstep(-.28,.78,sun));
    vec3 color = pigment * light;
    color += rim * mix(vec3(.029,.046,.078),vec3(.50,.31,.125),smoothstep(-.1,.45,sun));
    if (hover > .002) {
      float local = smoothstep(.67, .995, dot(n, glintNormal));
      float shine = .5 + .5 * sin(phase - 8. * n.x + 5. * n.y);
      float accents = smoothstep(.82, .99, sin(atlasUv.x * 144. + sin(atlasUv.y * 89.))
        * cos(atlasUv.y * 126. + phase * .45));
      color += vec3(.64,.48,.31) * hover * (.038 + .11 * rim + local * (.15 + .28 * shine + .23 * accents));
    }
    gl_FragColor = vec4(color * mix(.56,1.,focus), 1.);
    #include <colorspace_fragment>
  }`;

function ringMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: true, depthWrite: false,
    uniforms: { focus: { value: 0 }, hover: { value: 0 } },
    vertexShader: `varying float r; void main() {
      r = length(position.xy);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    }`,
    fragmentShader: `varying float r; uniform float focus; uniform float hover; void main() {
      float bands = .5 + .5 * sin(r * 112. + 2.5 * sin(r * 31.));
      float gap = smoothstep(.022,.038,abs(r-1.75));
      vec3 col = mix(vec3(.17,.092,.048),vec3(.72,.54,.32), bands*.56 + .44*abs(sin(r*7.5)));
      col += vec3(.19,.14,.085) * hover * bands;
      gl_FragColor=vec4(col*mix(.60,1.,focus), gap*(.49+.37*bands));
      #include <colorspace_fragment>
    }`,
  });
}

// Etched brass graduations around the selected sphere; each mark follows the same arc.
function engraving() {
  const points: number[] = [];
  const point = (r: number, a: number) => points.push(r * Math.cos(a), r * Math.sin(a), 0);
  for (let i = 0; i < 166; i++) {
    if (i > 70 && i < 106) continue;
    const angle = (i + 12) * Math.PI / 125;
    point(1.10, angle); point(1.10, angle + Math.PI / 125);
    if (i % 2 === 0) { point(1.12, angle); point(i % 10 === 0 ? 1.16 : 1.136, angle); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const m = new THREE.LineBasicMaterial({ color: 0xc79e67, transparent: true, opacity: .45, depthWrite: false });
  return new THREE.LineSegments(g, m);
}

// A Gaussian kernel in screen pixels with a circle of confusion derived from camera depth.
const compositeFrag = `
  uniform sampler2D image;
  uniform sampler2D depth;
  uniform vec2 pixel;
  varying vec2 vUv;
  vec4 sampleFrame(vec2 at) { return texture2D(image, at); }
  void main() {
    float z = texture2D(depth, vUv).r;
    float distanceToEye = (.1 * 120.) / (120. - z * (120.-.1));
    vec2 stride = pixel * (1.6 * smoothstep(11., 23., distanceToEye));
    vec4 color = sampleFrame(vUv);
    if (stride.x > .000001) {
      vec2 x = vec2(stride.x, 0.);
      vec2 y = vec2(0., stride.y);
      color = (4.*color + 2.*(sampleFrame(vUv+x)+sampleFrame(vUv-x)+sampleFrame(vUv+y)+sampleFrame(vUv-y))
          + sampleFrame(vUv+x+y)+sampleFrame(vUv+x-y)+sampleFrame(vUv-x+y)+sampleFrame(vUv-x-y)) / 16.;
    }
    gl_FragColor = vec4(color.rgb / max(color.a,.001), color.a);
    #include <colorspace_fragment>
    gl_FragColor.rgb *= gl_FragColor.a;
  }`;

type Props = { step: number; reducedMotion: boolean; onReady: (ready: boolean) => void };

export default function SolarScene({ step, reducedMotion, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ step, reducedMotion, onReady });
  useEffect(() => { state.current = { step, reducedMotion, onReady }; }, [step, reducedMotion, onReady]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const el = document.createElement("canvas");
    el.style.cssText = "width:100%;height:100%;display:block";
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch { return; }
    container.append(el);

    let disposed = false;
    let lost = false;
    let lastReady = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 120);
    const tanFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    renderer.setClearColor(0, 0);
    const target = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    target.depthTexture = new THREE.DepthTexture(1, 1, THREE.UnsignedShortType);
    const screen = new THREE.Scene();
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const plane = new THREE.PlaneGeometry(2, 2);
    const shader = new THREE.ShaderMaterial({
      uniforms: { image: { value: target.texture }, depth: { value: target.depthTexture }, pixel: { value: new THREE.Vector2() } },
      depthTest: false, depthWrite: false, blending: THREE.NoBlending,
      vertexShader: "varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader: compositeFrag,
    });
    screen.add(new THREE.Mesh(plane, shader));
    const sphere = new THREE.SphereGeometry(1, 72, 48);
    const loader = new THREE.TextureLoader();
    const clock = { value: 0 };
    const orbitRing = new THREE.Mesh(new THREE.RingGeometry(1.24, 2.07, 128), ringMaterial());
    orbitRing.rotation.x = -1.22;
    const planets = bodies.map((info, i) => {
      const group = new THREE.Group();
      const axis = new THREE.Group();
      axis.rotation.z = THREE.MathUtils.degToRad(info.tilt);
      const material = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag,
        uniforms: { atlas: { value: null }, focus: { value: 0 }, hover: { value: 0 },
          glintNormal: { value: new THREE.Vector3() }, phase: clock } });
      const mesh = new THREE.Mesh(sphere, material);
      // Continents and hand-painted marks make each axial rotation legible.
      mesh.rotation.y = info.id === "earth" ? -1.58 : i * .73;
      axis.add(mesh);
      if (info.id === "saturn") axis.add(orbitRing);
      group.add(axis);
      scene.add(group);
      const body = { group, mesh, loaded: false, texture: loader.load(`/solar/${info.id}.webp`, () => { if (!disposed) body.loaded = true; }) };
      body.texture.colorSpace = THREE.SRGBColorSpace;
      material.uniforms.atlas.value = body.texture;
      return body;
    });

    const scaleRing = engraving();
    scene.add(scaleRing);
    const pathGeometry = new THREE.BufferGeometry();
    const paths: number[] = [];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 208; i++) {
        for (const a of [i, i + 1]) {
          const t = a * Math.PI * 2 / 208;
          paths.push((13 + j * 4.8) * Math.cos(t), (4.3 + j * 1.8) * Math.sin(t), 0);
        }
      }
    }
    pathGeometry.setAttribute("position", new THREE.Float32BufferAttribute(paths, 3));
    const tracks = new THREE.LineSegments(pathGeometry,
      new THREE.LineBasicMaterial({ color: 0x927c67, transparent: true, opacity: .19, depthWrite: false }));
    tracks.rotation.z = .22;
    scene.add(tracks);

    let width = 1, height = 1, immediate = true, frame = 0, last = 0;
    const desired = new THREE.Vector3();
    const cameraGoal = new THREE.Vector3();
    const resize = () => {
      width = Math.max(1, el.clientWidth);
      height = Math.max(1, el.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6, Math.sqrt(2300000 / (width * height)));
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      target.setSize(Math.max(1, Math.floor(width * ratio)), Math.max(1, Math.floor(height * ratio)));
      shader.uniforms.pixel.value.set(1 / width, 1 / height);
      immediate = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    const interaction = container.closest("dialog");
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const bounds = new THREE.Sphere();
    const hit = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const ringHits: THREE.Intersection[] = [];
    let pointing = false;
    const leave = () => { pointing = false; };
    const point = (event: PointerEvent) => {
      pointing = event.pointerType === "mouse" || event.pointerType === "pen";
      if (!pointing) return;
      const rect = el.getBoundingClientRect();
      pointer.set(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
    };
    interaction?.addEventListener("pointermove", point, { passive: true });
    interaction?.addEventListener("pointerleave", leave);
    interaction?.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);

    // The rendered bodies are true spheres. Analytic ray hits keep the hover aligned
    // throughout the camera move without testing thousands of surface triangles.
    function hoveredBody() {
      if (!pointing) return -1;
      camera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, camera);
      let index = -1;
      let nearest = Infinity;
      planets.forEach(({ group, loaded }, i) => {
        if (!loaded) return;
        bounds.set(group.position, group.scale.x);
        if (!raycaster.ray.intersectSphere(bounds, hit)) return;
        const distance = raycaster.ray.origin.distanceToSquared(hit);
        if (distance >= nearest) return;
        nearest = distance;
        index = i;
        normal.copy(hit).sub(group.position).transformDirection(camera.matrixWorldInverse);
      });
      // Saturn's inclined ring extends beyond its spherical surface.
      if (planets[5].loaded) {
        orbitRing.updateWorldMatrix(true, false);
        ringHits.length = 0;
        orbitRing.raycast(raycaster, ringHits);
        for (const ringHit of ringHits) {
          if (ringHit.distance ** 2 >= nearest) continue;
          index = 5;
          nearest = ringHit.distance ** 2;
          normal.copy(ringHit.point).sub(planets[5].group.position).transformDirection(camera.matrixWorldInverse);
        }
      }
      return index;
    }

    const draw = (time: number) => {
      if (disposed || lost || document.hidden) return;
      frame = requestAnimationFrame(draw);
      if (last && time - last < 15) return;
      const dt = Math.min((time - (last || time)) / 1000, .06);
      last = time;
      const { step, reducedMotion } = state.current;
      const final = step === 8;
      const active = final ? 2 : step;
      const mobile = width <= 760;
      const blend = immediate || reducedMotion ? 1 : 1 - Math.exp(-5.4 * dt);
      // All stations have a distinct camera location; rear objects lag slightly during the dolly.
      cameraGoal.set(1.5 * Math.sin(step * .78), .42 * Math.sin(step * .6), 15 - step * 1.85);
      const cameraBlend = immediate || reducedMotion ? 1 : 1 - Math.exp(-3.8 * dt);
      camera.position.lerp(cameraGoal, cameraBlend);
      tracks.position.set(camera.position.x * .65 - 4, camera.position.y * .65 + 1.3, camera.position.z * .80 - 29);
      const radius = mobile
        ? Math.min(width * (final ? .24 : .30), height * (final ? .12 : .15))
        : Math.min(width * (final ? .15 : .19), height * (final ? .18 : .29));
      planets.forEach((body, i) => {
        const { anchor, distantRadius, speed } = bodies[i];
        const selected = i === active;
        const distance = selected ? 8 : 22 + i % 4 * 2.3;
        const x = selected ? (final ? .5 : (mobile ? .35 : .26) + (step % 2) * (mobile ? .30 : .48)) : anchor[0];
        const y = selected ? (mobile ? (final ? .36 : .32) : .50) : anchor[1];
        const halfHeight = tanFov * distance;
        desired.set(cameraGoal.x + (2 * x - 1) * halfHeight * camera.aspect,
          cameraGoal.y + (1 - 2 * y) * halfHeight, cameraGoal.z - distance);
        body.group.position.lerp(desired, blend);
        const pixels = selected ? radius * (i === 5 ? .67 : 1) : Math.min(width,height) * distantRadius;
        const scale = 2 * halfHeight * pixels / height;
        body.group.scale.setScalar(THREE.MathUtils.lerp(body.group.scale.x, scale, blend));
        body.mesh.rotation.y += dt * speed * (reducedMotion ? .24 : 1);
        const focus = body.mesh.material.uniforms.focus;
        focus.value = THREE.MathUtils.lerp(focus.value, selected ? 1 : 0, blend);
        body.group.visible = body.loaded;
        if (i === 5) orbitRing.material.uniforms.focus.value = focus.value;
      });
      const selected = planets[active];
      const hovered = hoveredBody();
      clock.value = reducedMotion ? 0 : time * .003;
      planets.forEach(({ mesh }, i) => {
        const uniforms = mesh.material.uniforms;
        const amount = i === hovered ? 1 : 0;
        uniforms.hover.value = reducedMotion ? amount : THREE.MathUtils.damp(uniforms.hover.value, amount, 11, dt);
        if (amount) uniforms.glintNormal.value.copy(normal);
      });
      orbitRing.material.uniforms.hover.value = planets[5].mesh.material.uniforms.hover.value;
      scaleRing.position.copy(selected.group.position);
      scaleRing.scale.copy(selected.group.scale);
      scaleRing.material.opacity = selected.mesh.material.uniforms.focus.value ** 3 * (active === 5 ? .19 : .42);
      scaleRing.visible = selected.loaded;
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(screen, ortho);
      immediate = false;
      if (lastReady !== selected.loaded) {
        lastReady = selected.loaded;
        state.current.onReady(lastReady);
      }
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!document.hidden && !lost) frame = requestAnimationFrame(draw);
    };
    const onLoss = (event: Event) => {
      event.preventDefault();
      lost = true;
      lastReady = false;
      state.current.onReady(false);
      cancelAnimationFrame(frame);
    };
    const onRestore = () => { lost = false; immediate = true; resume(); };
    el.addEventListener("webglcontextlost", onLoss);
    el.addEventListener("webglcontextrestored", onRestore);
    document.addEventListener("visibilitychange", resume);
    resume();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      interaction?.removeEventListener("pointermove", point);
      interaction?.removeEventListener("pointerleave", leave);
      interaction?.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
      el.removeEventListener("webglcontextlost", onLoss);
      el.removeEventListener("webglcontextrestored", onRestore);
      document.removeEventListener("visibilitychange", resume);
      planets.forEach(body => { body.texture.dispose(); body.mesh.material.dispose(); });
      sphere.dispose(); orbitRing.geometry.dispose(); orbitRing.material.dispose();
      scaleRing.geometry.dispose(); scaleRing.material.dispose();
      pathGeometry.dispose(); tracks.material.dispose();
      target.dispose(); plane.dispose(); shader.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      el.remove();
    };
  }, []);
  return <div ref={host} aria-hidden="true" className="solar-scene"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}
