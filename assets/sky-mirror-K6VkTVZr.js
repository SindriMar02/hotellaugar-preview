function Me(l){var se;const le={setLift(){},setVisible(){},resize(){},destroy(){}};let j=()=>{},J=!1;const k=p=>{var i;if(!J){J=!0;try{j()}catch{}try{(i=l==null?void 0:l.onFallback)==null||i.call(l,p)}catch{}}};try{let ve=function(){$(2,G,w,!1),ee=!0},xe=function(){$(3,z,M,!1),te=!0};const{container:p,media:i,markEl:D,lineEls:ce}=l,_=p.ownerDocument,s=_.defaultView,n=_.createElement("canvas"),fe={alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1},e=n.getContext("webgl2",fe)||n.getContext("webgl",fe);if(!e)return k(new Error("WebGL unavailable")),le;const R=typeof e.createVertexArray=="function",T=i.tagName==="VIDEO",X=s.matchMedia("(prefers-reduced-motion: reduce)"),b=_.createElement("canvas"),d=b.getContext("2d"),w=new Image,M=new Image;let m,B,C,O,G,z,o,Q=!1,I=!1,W=!0,y=!1,Z=!1,ee=!1,te=!1,h=0,re=NaN,ue=0,de=null,S="",v=null;const me=[],E=(t,a,r)=>{t.addEventListener(a,r),me.push(()=>t.removeEventListener(a,r))},x=t=>(...a)=>{if(!(Q||J))try{return t(...a)}catch(r){k(r)}},Ue=`${R?`#version 300 es
`:""}
      ${R?"in":"attribute"} vec2 a_pos; ${R?"out":"varying"} vec2 v_uv;
      void main() { v_uv = (a_pos + 1.0) * 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`,Le=`${R?`#version 300 es
`:""}
      precision highp float;
      ${R?"in":"varying"} vec2 v_uv;
      ${R?`out vec4 outColor;
#define SAMPLE texture
#define OUT outColor`:`#define SAMPLE texture2D
#define OUT gl_FragColor`}
      uniform sampler2D u_media, u_text, u_matte, u_still;
      uniform vec2 u_box, u_off, u_size, u_texel, u_strength;
      uniform float u_water, u_lift, u_alpha, u_time, u_motion, u_live, u_k;
      vec2 mediaUV(vec2 p) { vec2 m = (p - u_off) / u_size; return vec2(m.x, 1.0 - m.y); }
      const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
      // what the water is doing now: live frame minus the still-water median (0 for a still photo)
      float ripple(vec2 uv) { uv = clamp(uv, 0.0, 1.0); return u_live * (dot(SAMPLE(u_media, uv).rgb, LUMA) - dot(SAMPLE(u_still, uv).rgb, LUMA)); }
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
        // Sobel of the moving part of the water on a 3.5-texel stencil: ripple-sized, so strokes bend in waves, not grain
        vec2 s = 3.5 * u_texel;
        float a = ripple(uv + s * vec2(-1.0, 1.0)), b = ripple(uv + s * vec2(0.0, 1.0)), c = ripple(uv + s * vec2(1.0, 1.0));
        float d = ripple(uv + s * vec2(-1.0, 0.0)), e = ripple(uv),                      f = ripple(uv + s * vec2(1.0, 0.0));
        float g = ripple(uv + s * vec2(-1.0, -1.0)), h = ripple(uv + s * vec2(0.0, -1.0)), i = ripple(uv + s * vec2(1.0, -1.0));
        vec2 grad = clamp(vec2(c + 2.0*f + i - a - 2.0*d - g, g + 2.0*h + i - a - 2.0*b - c), -0.5, 0.5);
        float ramp = smoothstep(0.0, 14.0 * u_k, depth);         // the bank line itself stays still
        // the swell: wavelength ~14 px at the bank to ~60 px at the foot of the frame (1280-high frame units)
        float dn = depth / u_k;
        float phase = 4.0 * sqrt(dn) - u_time * 1.6 + sin(px.x / u_k * 0.0045 + u_time * 0.23) * 1.4;
        vec2 swell = vec2(sin(phase), 0.3 * cos(phase * 1.31 + 0.7)) * (0.9 + dn * 0.004) * u_k;
        vec2 src = vec2(px.x, 2.0 * u_water - px.y);             // the mirrored point above the water
        src += (grad * u_strength + swell * u_motion) * ramp;
        float sky = skyAt(src);
        if (sky <= 0.002) discard;
        vec2 tp = src - vec2(0.0, u_lift);
        float blur = 1.1 + depth * 0.006;                        // softer further from the bank
        vec4 t = textAt(tp) * 0.5 + (textAt(tp + vec2(blur, 0.0)) + textAt(tp - vec2(blur, 0.0))) * 0.25;
        float fade = mix(1.0, 0.7, clamp(depth / (0.45 * u_box.y), 0.0, 1.0));
        float k = u_alpha * sky * fade * clamp(1.0 + e * 2.2, 0.7, 1.3);   // shimmer with the water's flicker
        // reflected colour carries a little of the water under it (premultiplied)
        vec3 col = t.rgb * 0.88;                                 // water returns a little less light
        OUT = vec4(col * k, t.a * k);
      }`,he=(t,a)=>{const r=e.createShader(t);if(e.shaderSource(r,a),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(r);throw e.deleteShader(r),new Error(c||"shader")}return r},V=()=>{const t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array(4)),t},pe=()=>{m=e.createProgram();const t=he(e.VERTEX_SHADER,Ue),a=he(e.FRAGMENT_SHADER,Le);if(e.attachShader(m,t),e.attachShader(m,a),e.linkProgram(m),e.deleteShader(t),e.deleteShader(a),!e.getProgramParameter(m,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(m)||"link");e.useProgram(m),B=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,B),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const r=e.getAttribLocation(m,"a_pos");e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0),C=V(),O=V(),G=V(),z=V(),o={};for(const c of["media","text","matte","still","live","k","box","off","size","texel","strength","water","lift","alpha","time","motion"])o[c]=e.getUniformLocation(m,`u_${c}`);e.uniform1i(o.media,0),e.uniform1i(o.text,1),e.uniform1i(o.matte,2),e.uniform1i(o.still,3),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,0),Z=!1,ee=!1,te=!1,S="",re=NaN,w.complete&&w.naturalWidth&&ve(),M.complete&&M.naturalWidth&&xe()},$=(t,a,r,c)=>{if(e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,a),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,c),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.getError()!==e.NO_ERROR)throw new Error("texture upload failed")},ae=()=>{$(0,C,i,!1),Z=!0},N=t=>{if(!y||!Z||!ee||I||!W||_.hidden)return;const{w:a,h:r,ox:c,oy:H,sw:Y,sh:U,iw:ie,ih:K,water:q}=de;e.viewport(0,0,n.width,n.height),e.disable(e.SCISSOR_TEST),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(m),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,C),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,O),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,G),e.activeTexture(e.TEXTURE3),e.bindTexture(e.TEXTURE_2D,z),e.uniform1f(o.live,T&&te?1:0),e.uniform2f(o.box,a,r),e.uniform2f(o.off,c,H),e.uniform2f(o.size,Y,U),e.uniform2f(o.texel,1/ie,1/K);const f=U/1280;e.uniform1f(o.k,f);const F=l.strength||[56,20];e.uniform2f(o.strength,F[0]*f,F[1]*f),e.uniform1f(o.water,q),e.uniform1f(o.lift,ue),e.uniform1f(o.alpha,l.alpha??.5),e.uniform1f(o.time,t/1e3),e.uniform1f(o.motion,X.matches?0:1);const L=n.height/r,P=Math.max(0,Math.floor((r-q)*L));e.enable(e.SCISSOR_TEST),e.scissor(0,0,n.width,P),e.drawArrays(e.TRIANGLE_STRIP,0,4)},Pe=()=>T&&!i.paused&&!i.ended&&i.readyState>=2,_e=x(t=>{h=0,!(!W||_.hidden||I||!y)&&(Pe()&&i.currentTime!==re&&(ae(),re=i.currentTime),N(t),X.matches||(h=s.requestAnimationFrame(_e)))}),A=()=>{h||(h=s.requestAnimationFrame(_e))},g=x(()=>{if(I)return;const t=p.clientWidth,a=p.clientHeight,r=T?i.videoWidth:i.naturalWidth,c=T?i.videoHeight:i.naturalHeight;if(!t||!a||!r||!c){y=!1;return}const H=Math.max(t/r,a/c),Y=r*H,U=c*H,ie=(t-Y)/2,K=(a-U)*(l.focusY??.5),q=K+(l.waterline??.588)*U,f=s.getComputedStyle(D),F=[t,a,r,c,l.focusY,f.font,f.color,D.offsetTop,D.offsetLeft,s.devicePixelRatio,ce.map(u=>u.offsetLeft+","+u.offsetTop).join(";")].join("|");if(y&&F===S)return;const L=Math.min(s.devicePixelRatio||1,l.dpr??1.5);n.width=Math.round(t*L),n.height=Math.round(a*L),b.width=n.width,b.height=n.height,d.setTransform(L,0,0,L,0,0),d.clearRect(0,0,t,a);const P=parseFloat(f.fontSize),ke=parseFloat(f.lineHeight)||P;d.font=`${f.fontWeight} ${P}px ${f.fontFamily}`,d.textBaseline="alphabetic",d.textAlign="left",d.fillStyle=f.color;const oe=f.letterSpacing==="normal"?0:parseFloat(f.letterSpacing)||0,Te="letterSpacing"in d;Te&&(d.letterSpacing=`${oe}px`);let Ee=0,ge=0;for(let u=D;u&&u!==p;u=u.offsetParent)Ee+=u.offsetLeft,ge+=u.offsetTop;for(const u of ce){const ne=u.textContent,we=d.measureText(ne),Ae=we.fontBoundingBoxAscent??P*.8,De=we.fontBoundingBoxDescent??P*.2,Re=Ee+u.offsetLeft,be=ge+u.offsetTop+(ke-Ae-De)/2+Ae;if(Te||!oe)d.fillText(ne,Re,be);else{let ye=Re;for(const Se of ne)d.fillText(Se,ye,be),ye+=d.measureText(Se).width+oe}}$(1,O,b,!0),de={w:t,h:a,ox:ie,oy:K,sw:Y,sh:U,iw:r,ih:c,water:q},y=!0,S=F,(!T&&i.complete||T&&i.readyState>=2)&&ae(),N(s.performance.now()),A()});return j=()=>{Q||(Q=!0,h&&s.cancelAnimationFrame(h),h=0,me.splice(0).forEach(t=>t()),v==null||v.disconnect(),B&&e.deleteBuffer(B),[C,O,G,z].forEach(t=>t&&e.deleteTexture(t)),m&&e.deleteProgram(m),n.remove(),b.width=b.height=1)},pe(),n.className="hl-water",n.setAttribute("aria-hidden","true"),n.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;background:transparent;",p.append(n),w.decoding="async",w.onload=x(()=>{ve(),N(s.performance.now()),A()}),w.onerror=()=>k(new Error("matte failed to load")),w.src=l.matte,l.still&&(M.onload=x(()=>{xe(),A()}),M.src=l.still),E(n,"webglcontextlost",t=>{t.preventDefault(),I=!0,h&&s.cancelAnimationFrame(h),h=0}),E(n,"webglcontextrestored",x(()=>{I=!1,pe(),S="",g()})),E(i,T?"loadeddata":"load",g),T&&E(i,"playing",x(()=>{y||g(),A()})),E(i,"error",()=>k(new Error("media failed"))),E(_,"visibilitychange",x(()=>{_.hidden||A()})),E(X,"change",x(()=>{N(s.performance.now()),A()})),v=s.ResizeObserver?new s.ResizeObserver(()=>g()):null,v==null||v.observe(p),v==null||v.observe(D),E(s,"resize",g),(se=_.fonts)==null||se.ready.then(()=>{S="",g()}),g(),{setLift:x(t=>{ue=Number(t)||0,(X.matches||!h)&&N(s.performance.now())}),setVisible:x(t=>{W=!!t,W&&A()}),resize:()=>{S="",g()},destroy:()=>{try{j()}catch{}}}}catch(p){return k(p),le}}export{Me as mountSkyMirror};
