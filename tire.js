import * as THREE from './vendor/three.module.js';

export function tireGeometry(radius){
 const profile=[[-.54,.24],[-.56,.58],[-.55,.84],[-.47,.965],[-.29,1],[.29,1],[.47,.965],[.55,.84],[.56,.58],[.54,.24]],segments=48,positions=[],indices=[];
 for(let j=0;j<profile.length;j++)for(let i=0;i<=segments;i++){let a=i/segments*Math.PI*2;const wobble=1+.006*Math.sin(a*13)+.004*Math.sin(a*7);positions.push(profile[j][0],Math.cos(a)*profile[j][1]*radius*wobble,Math.sin(a)*profile[j][1]*radius*wobble);}
 for(let j=0;j<profile.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
