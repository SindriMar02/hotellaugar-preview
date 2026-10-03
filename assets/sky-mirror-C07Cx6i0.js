function Ue(d){var ie;const oe={setLift(){},setVisible(){},resize(){},destroy(){}};let H=()=>{},Y=!1;const D=v=>{var o;if(!Y){Y=!0;try{H()}catch{}try{(o=d==null?void 0:d.onFallback)==null||o.call(d,v)}catch{}}};try{let de=function(){Z(2,O,R,!1),q=!0};const{container:v,media:o,markEl:I,lineEls:ne}=d,T=v.ownerDocument,n=T.defaultView,i=T.createElement("canvas"),ce={alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1},e=i.getContext("webgl2",ce)||i.getContext("webgl",ce);if(!e)return D(new Error("WebGL unavailable")),oe;const A=typeof e.createVertexArray=="function",g=o.tagName==="VIDEO",k=n.matchMedia("(prefers-reduced-motion: reduce)"),b=T.createElement("canvas"),f=b.getContext("2d"),R=new Image;let u,B,C,X,O,c,K=!1,M=!1,G=!0,w=!1,j=!1,q=!1,h=0,J=NaN,le=0,se=null,y="",x=null;const fe=[],p=(t,a,r)=>{t.addEventListener(a,r),fe.push(()=>t.removeEventListener(a,r))},E=t=>(...a)=>{if(!(K||Y))try{return t(...a)}catch(r){D(r)}},be=`${A?`#version 300 es
`:""}
      ${A?"in":"attribute"} vec2 a_pos; ${A?"out":"varying"} vec2 v_uv;
      void main() { v_uv = (a_pos + 1.0) * 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`,we=`${A?`#version 300 es
`:""}
      precision highp float;
      ${A?"in":"varying"} vec2 v_uv;
      ${A?`out vec4 outColor;
#define SAMPLE texture
#define OUT outColor`:`#define SAMPLE texture2D
#define OUT gl_FragColor`}
      uniform sampler2D u_media, u_text, u_matte;
      uniform vec2 u_box, u_off, u_size, u_texel, u_strength;
      uniform float u_water, u_lift, u_alpha, u_time, u_motion;
      vec2 mediaUV(vec2 p) { vec2 m = (p - u_off) / u_size; return vec2(m.x, 1.0 - m.y); }
      float lum(vec2 uv) { return dot(SAMPLE(u_media, clamp(uv, 0.0, 1.0)).rgb, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 textAt(vec2 p) {                       // p in container px; texture = the whole box, name at rest
        vec2 t = p / u_box;
        if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return vec4(0.0);
        return SAMPLE(u_text, vec2(t.x, 1.0 - t.y));
      }
      float skyAt(vec2 p) { vec2 m = mediaUV(p); if (m.x < 0.0 || m.x > 1.0 || m.y < 0.0 || m.y > 1.0) return 0.0; return SAMPLE(u_matte, m).a; }
      void main() {
        vec2 px = vec2(v_uv.x, 1.0 - v_uv.y) * u_box;
        float depth = px.y - u_water;
        if (depth <= 0.0) discard;
        vec2 uv = mediaUV(px);
        // Sobel on a two-texel stencil of the live frame: the slope of the water surface at this point
        vec2 s = 2.0 * u_texel;
        float a = lum(uv + s * vec2(-1.0, 1.0)), b = lum(uv + s * vec2(0.0, 1.0)), c = lum(uv + s * vec2(1.0, 1.0));
        float d = lum(uv + s * vec2(-1.0, 0.0)), e = lum(uv),                      f = lum(uv + s * vec2(1.0, 0.0));
        float g = lum(uv + s * vec2(-1.0, -1.0)), h = lum(uv + s * vec2(0.0, -1.0)), i = lum(uv + s * vec2(1.0, -1.0));
        vec2 grad = clamp(vec2(c + 2.0*f + i - a - 2.0*d - g, g + 2.0*h + i - a - 2.0*b - c), -0.65, 0.65);
        float ramp = smoothstep(0.0, 18.0, depth);               // the bank line itself stays still
        vec2 src = vec2(px.x, 2.0 * u_water - px.y);             // the mirrored point above the water
        src += grad * u_strength * ramp;
        src += vec2(sin(u_time * 0.37 + px.y * 0.025) * 1.2, sin(u_time * 0.29 + px.x * 0.007) * 0.5) * ramp * u_motion;
        float sky = skyAt(src);
        if (sky <= 0.002) discard;
        vec2 tp = src - vec2(0.0, u_lift);
        float blur = 1.1 + depth * 0.006;                        // softer further from the bank
        vec4 t = textAt(tp) * 0.5 + (textAt(tp + vec2(blur, 0.0)) + textAt(tp - vec2(blur, 0.0))) * 0.25;
        float fade = mix(1.0, 0.7, clamp(depth / (0.45 * u_box.y), 0.0, 1.0));
        float k = u_alpha * sky * fade;
        // reflected colour carries a little of the water under it (premultiplied)
        vec3 col = mix(t.rgb, t.rgb * (0.6 + 0.4 * e), 0.5);
        OUT = vec4(col * k, t.a * k);
      }`,ue=(t,a)=>{const r=e.createShader(t);if(e.shaderSource(r,a),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const l=e.getShaderInfoLog(r);throw e.deleteShader(r),new Error(l||"shader")}return r},Q=()=>{const t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array(4)),t},me=()=>{u=e.createProgram();const t=ue(e.VERTEX_SHADER,be),a=ue(e.FRAGMENT_SHADER,we);if(e.attachShader(u,t),e.attachShader(u,a),e.linkProgram(u),e.deleteShader(t),e.deleteShader(a),!e.getProgramParameter(u,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(u)||"link");e.useProgram(u),B=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,B),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const r=e.getAttribLocation(u,"a_pos");e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),C=Q(),X=Q(),O=Q(),c={};for(const l of["media","text","matte","box","off","size","texel","strength","water","lift","alpha","time","motion"])c[l]=e.getUniformLocation(u,`u_${l}`);e.uniform1i(c.media,0),e.uniform1i(c.text,1),e.uniform1i(c.matte,2),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,0),j=!1,q=!1,y="",J=NaN,R.complete&&R.naturalWidth&&de()},Z=(t,a,r,l)=>{if(e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,a),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,l),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.getError()!==e.NO_ERROR)throw new Error("texture upload failed")},ee=()=>{Z(0,C,o,!1),j=!0},N=t=>{if(!w||!j||!q||M||!G||T.hidden)return;const{w:a,h:r,ox:l,oy:z,sw:V,sh:L,iw:te,ih:W,water:$}=se;e.viewport(0,0,i.width,i.height),e.disable(e.SCISSOR_TEST),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(u),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,C),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,X),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,O),e.uniform2f(c.box,a,r),e.uniform2f(c.off,l,z),e.uniform2f(c.size,V,L),e.uniform2f(c.texel,1/te,1/W);const m=L/1280,F=d.strength||[18,7];e.uniform2f(c.strength,F[0]*m,F[1]*m),e.uniform1f(c.water,$),e.uniform1f(c.lift,le),e.uniform1f(c.alpha,d.alpha??.5),e.uniform1f(c.time,t/1e3),e.uniform1f(c.motion,k.matches?0:1);const U=i.height/r,P=Math.max(0,Math.floor((r-$)*U));e.enable(e.SCISSOR_TEST),e.scissor(0,0,i.width,P),e.drawArrays(e.TRIANGLE_STRIP,0,4)},ye=()=>g&&!o.paused&&!o.ended&&o.readyState>=2,he=E(t=>{h=0,!(!G||T.hidden||M||!w)&&(ye()&&o.currentTime!==J&&(ee(),J=o.currentTime),N(t),k.matches||(h=n.requestAnimationFrame(he)))}),S=()=>{h||(h=n.requestAnimationFrame(he))},_=E(()=>{if(M)return;const t=v.clientWidth,a=v.clientHeight,r=g?o.videoWidth:o.naturalWidth,l=g?o.videoHeight:o.naturalHeight;if(!t||!a||!r||!l){w=!1;return}const z=Math.max(t/r,a/l),V=r*z,L=l*z,te=(t-V)/2,W=(a-L)/2,$=W+(d.waterline??.588)*L,m=n.getComputedStyle(I),F=[t,a,r,l,m.font,m.color,I.offsetTop,I.offsetLeft,n.devicePixelRatio,ne.map(s=>s.offsetLeft+","+s.offsetTop).join(";")].join("|");if(w&&F===y)return;const U=Math.min(n.devicePixelRatio||1,d.dpr??1.5);i.width=Math.round(t*U),i.height=Math.round(a*U),b.width=i.width,b.height=i.height,f.setTransform(U,0,0,U,0,0),f.clearRect(0,0,t,a);const P=parseFloat(m.fontSize),Se=parseFloat(m.lineHeight)||P;f.font=`${m.fontWeight} ${P}px ${m.fontFamily}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle=m.color;const re=m.letterSpacing==="normal"?0:parseFloat(m.letterSpacing)||0,ve="letterSpacing"in f;ve&&(f.letterSpacing=`${re}px`);let xe=0,Ee=0;for(let s=I;s&&s!==v;s=s.offsetParent)xe+=s.offsetLeft,Ee+=s.offsetTop;for(const s of ne){const ae=s.textContent,Te=f.measureText(ae),pe=Te.fontBoundingBoxAscent??P*.8,Le=Te.fontBoundingBoxDescent??P*.2,_e=xe+s.offsetLeft,ge=Ee+s.offsetTop+(Se-pe-Le)/2+pe;if(ve||!re)f.fillText(ae,_e,ge);else{let Re=_e;for(const Ae of ae)f.fillText(Ae,Re,ge),Re+=f.measureText(Ae).width+re}}Z(1,X,b,!0),se={w:t,h:a,ox:te,oy:W,sw:V,sh:L,iw:r,ih:l,water:$},w=!0,y=F,(!g&&o.complete||g&&o.readyState>=2)&&ee(),N(n.performance.now()),S()});return H=()=>{K||(K=!0,h&&n.cancelAnimationFrame(h),h=0,fe.splice(0).forEach(t=>t()),x==null||x.disconnect(),B&&e.deleteBuffer(B),[C,X,O].forEach(t=>t&&e.deleteTexture(t)),u&&e.deleteProgram(u),i.remove(),b.width=b.height=1)},me(),i.className="hl-water",i.setAttribute("aria-hidden","true"),i.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;background:transparent;",v.append(i),R.decoding="async",R.onload=E(()=>{de(),N(n.performance.now()),S()}),R.onerror=()=>D(new Error("matte failed to load")),R.src=d.matte,p(i,"webglcontextlost",t=>{t.preventDefault(),M=!0,h&&n.cancelAnimationFrame(h),h=0}),p(i,"webglcontextrestored",E(()=>{M=!1,me(),y="",_()})),p(o,g?"loadeddata":"load",_),g&&p(o,"playing",E(()=>{w||_(),S()})),p(o,"error",()=>D(new Error("media failed"))),p(T,"visibilitychange",E(()=>{T.hidden||S()})),p(k,"change",E(()=>{N(n.performance.now()),S()})),x=n.ResizeObserver?new n.ResizeObserver(()=>_()):null,x==null||x.observe(v),x==null||x.observe(I),p(n,"resize",_),(ie=T.fonts)==null||ie.ready.then(()=>{y="",_()}),_(),{setLift:E(t=>{le=Number(t)||0,(k.matches||!h)&&N(n.performance.now())}),setVisible:E(t=>{G=!!t,G&&S()}),resize:()=>{y="",_()},destroy:()=>{try{H()}catch{}}}}catch(v){return D(v),oe}}export{Ue as mountSkyMirror};
