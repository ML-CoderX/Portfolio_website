import { useEffect, useRef, type MutableRefObject } from "react";
import type * as THREE from "three";

type Props = { progress: MutableRefObject<number>; pointer: MutableRefObject<{x:number;y:number}>; paused: boolean };

/** A continuous dolly through a field of server monoliths. All geometry is local. */
export function CinematicWorld({ progress, pointer, paused }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};
    // Decorative WebGL is separate from the content needed for the first render.
    void import("three").then(THREE => {
    if (cancelled) return;
    const canvas = canvasRef.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch { return; } // The image plate remains visible without WebGL.
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1018, 0.038);
    const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 140);
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const trackGeo = <T extends THREE.BufferGeometry>(g:T) => { geometries.push(g); return g; };
    const trackMat = <T extends THREE.Material>(m:T) => { materials.push(m); return m; };
    const body = trackMat(new THREE.MeshStandardMaterial({ color:0x111d29, roughness:0.45, metalness:0.65 }));
    const light = trackMat(new THREE.MeshBasicMaterial({ color:0x7da8bc, transparent:true, opacity:0.5 }));
    const warm = trackMat(new THREE.MeshBasicMaterial({ color:0xc26c4e, transparent:true, opacity:0.7 }));
    const box = trackGeo(new THREE.BoxGeometry(1.3,4,1.2));
    const slot = trackGeo(new THREE.BoxGeometry(1.04,0.025,0.025));
    const led = trackGeo(new THREE.BoxGeometry(0.035,0.035,0.03));
    for (let i = 0; i < 24; i++) {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(box,body));
      for(let j=0;j<10;j++) {
        const line = new THREE.Mesh(slot,light); line.position.set(0,-1.6+j*0.35,0.615); group.add(line);
        const dot = new THREE.Mesh(led,j%3 ? light:warm); dot.position.set(0.45,-1.5+j*0.35,0.64); group.add(dot);
      }
      group.position.set((i%2 ? 1:-1)*(6+(i%3)*1.15), -1.1, 5-Math.floor(i/2)*6);
      group.rotation.y = i%2 ? -0.18:0.18;
      scene.add(group);
    }
    scene.add(new THREE.AmbientLight(0x7896b7,1.7));
    const key = new THREE.DirectionalLight(0xbed8ec,4); key.position.set(2,7,8); scene.add(key);
    const glow = new THREE.PointLight(0xb76549,35,25); glow.position.set(0,2,-10); scene.add(glow);
    const count = innerWidth < 700 ? 100:240;
    const positions = new Float32Array(count*3);
    for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*34;positions[i*3+1]=(Math.random()-.5)*20;positions[i*3+2]=12-Math.random()*100;}
    const dotsGeo=trackGeo(new THREE.BufferGeometry());dotsGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));
    const dotsMat=trackMat(new THREE.PointsMaterial({color:0xabc5d3,size:0.035,transparent:true,opacity:0.6,depthWrite:false}));
    const dots=new THREE.Points(dotsGeo,dotsMat);scene.add(dots);
    const ringGeo=trackGeo(new THREE.TorusGeometry(3.5,0.012,6,100));
    const ring=new THREE.Mesh(ringGeo,warm);ring.position.set(3.5,2,-22);scene.add(ring);
    let frame=0, last=performance.now(), travel=progress.current, elapsed=0;
    const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.5));renderer.setSize(innerWidth,innerHeight,false);};
    resize();window.addEventListener("resize",resize);
    const draw=(now:number)=>{
      frame=requestAnimationFrame(draw);
      const dt=Math.min((now-last)/1000,0.05);last=now;
      if(document.hidden)return;
      const still=pausedRef.current;
      if(!still){elapsed+=dt;travel+=(progress.current-travel)*(1-Math.exp(-dt*3));}
      const x=still?0:pointer.current.x;
      const y=still?0:pointer.current.y;
      camera.position.set(Math.sin(travel*Math.PI*2)*1.6+x*0.65, 1.5-y*0.35, 16-travel*56);
      camera.lookAt(Math.sin(travel*Math.PI*2)*0.6,0.8, -20-travel*56);
      dots.rotation.z=Math.sin(elapsed*0.04)*0.03;
      dots.position.y=Math.sin(elapsed*0.15)*0.8;
      ring.rotation.z=elapsed*0.06;
      glow.position.z=-10-travel*45;
      renderer.render(scene,camera);
    };
    frame=requestAnimationFrame(draw);
    const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);canvas.style.opacity="0";};
    canvas.addEventListener("webglcontextlost",lost);
    dispose=()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);canvas.removeEventListener("webglcontextlost",lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();};
    }).catch(() => { dispose(); }); // The static background remains usable if WebGL cannot load.
    return () => { cancelled = true; dispose(); };
  },[progress,pointer]);
  return <canvas ref={canvasRef} className="world-canvas"/>;
}
