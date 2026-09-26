import * as THREE from './vendor/three.module.js';

function random(seed){return()=>{seed=Math.imul(seed^seed>>>15,1|seed)+0x6d2b79f5|0;return(seed>>>0)/4294967296;};}

export function makeEngraving(){
 const c=document.createElement('canvas');c.width=2048;c.height=1024;const ctx=c.getContext('2d'),rng=random(6147);
 function ragged(x,y,dx,dy,length){ctx.beginPath();ctx.moveTo(x,y);for(let i=1;i<=length;i++){x+=dx+(rng()-.5)*4;y+=dy+(rng()-.5)*4;ctx.lineTo(x,y);}ctx.stroke();}
 // Chips collect at panel joints, corners and fasteners; most paint stays quiet.
 for(let i=0;i<1500;i++){const joints=[26,312,571,796,1252,1480,1721,2020];const x=joints[i%joints.length]+(rng()-.5)*32,y=30+rng()*945;ctx.strokeStyle=`rgba(14,13,19,${.3+rng()*.65})`;ctx.lineWidth=1.8+rng()*3.7;ragged(x,y,(rng()-.4)*2,2+rng()*3,2+Math.floor(rng()*5));if(i%6===0){ctx.fillStyle='rgba(19,17,23,.65)';ctx.fillRect(x,y,2+rng()*7,1+rng()*5);}}
 for(let i=0;i<350;i++){const x=rng()*2048,y=rng()*1024;ctx.strokeStyle='rgba(15,14,21,.26)';ctx.lineWidth=.65;ragged(x,y,2,-1,2+Math.floor(rng()*5));}
 // Fine irregular fastener rings interrupt long machine-straight seams.
 for(let x of [70,347,730,1318,1690,1974])for(let y of [57,282,711,971]){ctx.strokeStyle='rgba(10,10,17,.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(x,y,3.4,2.7,.2,0,Math.PI*1.85);ctx.stroke();ragged(x-6,y+8,2,.1,5);}
 const texture=new THREE.CanvasTexture(c);texture.anisotropy=4;const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 return{material,dispose(){texture.dispose();material.dispose();}};
}

export function addChassis(parent,w,ink,plates){
 const verts=[[-w,.05,3.5],[w,.05,3.5],[w,-.12,-2.8],[-w,-.12,-2.8],[-w*.64,-1.23,2.35],[w*.64,-1.23,2.35],[w*.67,-.95,-2.5],[-w*.67,-.95,-2.5]];
 const faces=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]],a=[];
 for(const [i,j,k,l] of faces)for(const n of [i,k,j,i,l,k])a.push(...verts[n]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.computeVertexNormals();const m=new THREE.Mesh(g,plates[0]);m.castShadow=true;parent.add(m);m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,20),ink));
 // Three non-identical armor plates lie on the rear chamfer, with inset service cuts.
 const panel=(x0,x1,t0,t1,material)=>{const pt=(x,t)=>[x*(1-.36*t),.05-1.28*t,3.513-1.15*t];const points=[pt(x0,t0),pt(x1,t0),pt(x1,t1),pt(x0,t1)];const p=[];for(const i of [0,2,1,0,3,2])p.push(...points[i]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.computeVertexNormals();const o=new THREE.Mesh(geo,material);o.castShadow=true;parent.add(o);o.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),ink));};
 panel(-w+.07,-.78,.04,.78,plates[1]);panel(-.73,.56,.03,.92,plates[2]);panel(.61,w-.08,.05,.74,plates[1]);panel(-.35,.35,.57,.76,plates[0]);
 const lines=[],rng=random(871);for(let i=0;i<190;i++){const t=.08+rng()*.76,x=(rng()-.5)*w*1.7*(1-.36*t),y=.05-1.28*t,z=3.525-1.15*t,len=.01+rng()*.065;lines.push(x,y,z,x+len,y-len*.2,z+.002);}
 const lineGeo=new THREE.BufferGeometry();lineGeo.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));parent.add(new THREE.LineSegments(lineGeo,ink));
}
