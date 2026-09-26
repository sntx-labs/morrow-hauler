import * as THREE from './vendor/three.module.js';

// Depth contours and broken luminance edges are rendered at the actual canvas size.
export function makeIllustration(renderer,camera,settings){
 const target=new THREE.WebGLRenderTarget(1,1,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});
 target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
 const uniforms={frame:{value:target.texture},depth:{value:target.depthTexture},texel:{value:new THREE.Vector2(1,1)},near:{value:camera.near},far:{value:camera.far},ink:{value:settings.inkDetail},grain:{value:settings.filmGrain}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform sampler2D frame,depth;uniform vec2 texel;uniform float near,far,ink,grain;
 float viewZ(float d){return near*far/(far-d*(far-near));}
 float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
 float hash(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
 void main(){
  vec3 c=texture2D(frame,vUv).rgb;float z=viewZ(texture2D(depth,vUv).r),edge=0.;
  for(int i=0;i<4;i++){vec2 axis=i==0?vec2(1.,0.):i==1?vec2(-1.,0.):i==2?vec2(0.,1.):vec2(0.,-1.);vec2 uv=vUv+axis*texel;vec3 n=texture2D(frame,uv).rgb;float nz=viewZ(texture2D(depth,uv).r);float silhouette=smoothstep(.007,.025,abs(z-nz)/max(1.,z));float tonal=smoothstep(.018,.065,abs(lum(c)-lum(n)));edge=max(edge,max(silhouette,tonal*.62*step(z,far*.9)));}
  float grit=hash(floor(vUv/texel));c*=1.-edge*ink*(.65+.25*grit);
  gl_FragColor=vec4(c,1.);
  #include <colorspace_fragment>
  gl_FragColor.rgb+=vec3((grit-.5)*grain*.065);
 }
 `});
 const screen=new THREE.Scene(),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material),ortho=new THREE.Camera();screen.add(quad);
 renderer.info.autoReset=false;
 return {resize(w,h){target.setSize(w,h);uniforms.texel.value.set(1/w,1/h);},render(scene){renderer.info.reset();uniforms.ink.value=settings.inkDetail;uniforms.grain.value=settings.filmGrain;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(screen,ortho);},dispose(){target.dispose();target.depthTexture.dispose();quad.geometry.dispose();material.dispose();}};
}
