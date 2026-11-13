(function(){
"use strict";
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var $=function(s,r){return(r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function consent(){
var banner=$("#consent-banner");
if(!banner)return;
var KEY="consent_choice";
var get=function(){var m=document.cookie.match("(?:^|; )"+KEY+"=([^;]*)");return m?decodeURIComponent(m[1]):null;};
var apply=function(choice){
var v=choice==="accepted"?"granted":"denied";
if(typeof window.gtag==="function")window.gtag("consent","update",{ad_storage:v,ad_user_data:v,ad_personalization:v,analytics_storage:v});
};
var stored=get();
if(stored)apply(stored);else banner.hidden=false;
var choose=function(choice){
document.cookie=KEY+"="+encodeURIComponent(choice)+";path=/;max-age=31536000;SameSite=Lax";
apply(choice);
banner.hidden=true;
};
var yes=$("#consent-accept"),no=$("#consent-decline"),again=$("#cookie-settings");
if(yes)yes.addEventListener("click",function(){choose("accepted");});
if(no)no.addEventListener("click",function(){choose("declined");});
if(again)again.addEventListener("click",function(){banner.hidden=false;yes&&yes.focus();});
}
function chrome(){
var top=$(".pr-top");
if(!top)return;
var set=function(){document.documentElement.style.setProperty("--chrome-h",top.offsetHeight+"px");};
if("ResizeObserver"in window)new ResizeObserver(set).observe(top);
else{set();window.addEventListener("resize",set);}
}
function activeNav(){
var links=$$(".pr-nav a[href^='#']");
if(!links.length||!("IntersectionObserver"in window))return;
var io=new IntersectionObserver(function(es){
es.forEach(function(e){
if(!e.isIntersecting)return;
links.forEach(function(a){
if(a.getAttribute("href")==="#"+e.target.id)a.setAttribute("aria-current","true");
else a.removeAttribute("aria-current");
});
});
},{rootMargin:"-45% 0px -50% 0px"});
["story","menu","visit"].forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el);});
}
function reel(){
var vids=$$(".pr-tape video, .pr-club-video video");
var setPoster=function(v){if(v.dataset.poster){v.poster=v.dataset.poster;v.removeAttribute("data-poster");}};
if("IntersectionObserver"in window){
var pio=new IntersectionObserver(function(es){
es.forEach(function(e){if(e.isIntersecting){setPoster(e.target);pio.unobserve(e.target);}});
},{rootMargin:"600px 0px"});
vids.forEach(function(v){pio.observe(v);});
}else vids.forEach(setPoster);
if(!vids.length||reduce||!("IntersectionObserver"in window))return;
var io=new IntersectionObserver(function(es){
es.forEach(function(e){
if(e.isIntersecting)e.target.play().catch(function(){});else e.target.pause();
});
},{threshold:0.4});
vids.forEach(function(v){io.observe(v);});
}
function handwriting(){
var svg=$(".pr-hot");
if(!svg)return;
fetch(svg.dataset.glyphs).then(function(r){return r.json();}).then(function(font){
var NS="http://www.w3.org/2000/svg",g=document.createElementNS(NS,"g"),x=0,paths=[];
svg.appendChild(g);
Array.from(svg.dataset.text).forEach(function(ch){
if(ch===" "){x+=font.space;return;}
var gl=font.c[ch.charCodeAt(0)];
if(!gl)return;
var cg=document.createElementNS(NS,"g");
g.appendChild(cg);
gl.paths.forEach(function(p){
var el=document.createElementNS(NS,"path");
el.setAttribute("d","M"+p.mx+" "+(-p.my)+p.d.replace(/^m\s*0,0/i,""));
cg.appendChild(el);
paths.push(el);
});
var bb=cg.getBBox();
cg.setAttribute("transform","translate("+(x-bb.x)+" 0)");
x+=bb.width+0.3;
});
var b=g.getBBox(),pad=3;
svg.setAttribute("viewBox",[b.x-pad,b.y-pad,b.width+pad*2,b.height+pad*2].join(" "));
var len=paths.map(function(p){
p.setAttribute("fill","none");p.setAttribute("stroke","#421212");p.setAttribute("stroke-width","2");
p.setAttribute("stroke-linecap","round");p.setAttribute("stroke-linejoin","round");
return p.getTotalLength();
});
var total=len.reduce(function(a,c){return a+c;},0);
paths.forEach(function(p,k){p.style.strokeDasharray=len[k]+" "+(len[k]+2);});
function draw(q){
var d=q*total;
paths.forEach(function(p,k){var s=Math.max(0,Math.min(len[k],d));d-=len[k];p.style.strokeDashoffset=len[k]-s;});
}
if(reduce){draw(1);return;}
var raf=0;
function upd(){
raf=0;
var r=svg.getBoundingClientRect();
draw(Math.max(0,Math.min(1,(innerHeight*0.95-r.top)/(innerHeight*0.5))));
}
function on(){if(!raf)raf=requestAnimationFrame(upd);}
on();
window.addEventListener("scroll",on,{passive:true});
window.addEventListener("resize",on);
}).catch(function(){});
}
function burger(){
var btn=$(".pr-burger"),header=$(".pr-header"),nav=$("#pr-nav");
if(!btn||!header||!nav)return;
var root=document.documentElement,body=document.body,saved=0,locked=false;
var mq=window.matchMedia("(min-width: 761px)");
var lock=function(){
if(locked)return;
saved=window.pageYOffset||root.scrollTop||0;
body.style.cssText+=";position:fixed;top:"+(-saved)+"px;left:0;right:0;width:100%";
locked=true;
};
var unlock=function(){
if(!locked)return;
body.style.position="";body.style.top="";body.style.left="";body.style.right="";body.style.width="";
locked=false;
var prev=root.style.scrollBehavior;root.style.scrollBehavior="auto";
window.scrollTo(0,saved);
root.style.scrollBehavior=prev;
};
var isOpen=function(){return header.classList.contains("is-open");};
var set=function(open,returnFocus){
if(open===isOpen())return;
header.classList.toggle("is-open",open);
root.classList.toggle("pr-menu-open",open);
btn.setAttribute("aria-expanded",open?"true":"false");
btn.setAttribute("aria-label",open?"Close menu":"Menu");
if(open){lock();var first=nav.querySelector("a");if(first)first.focus({preventScroll:true});}
else{unlock();if(returnFocus)btn.focus({preventScroll:true});}
};
btn.addEventListener("click",function(){set(!isOpen(),true);});
$$("#pr-nav a").forEach(function(a){a.addEventListener("click",function(){set(false,false);});});
document.addEventListener("keydown",function(e){
if(!isOpen())return;
if(e.key==="Escape"){set(false,true);return;}
if(e.key!=="Tab")return;
var f=[btn].concat($$("#pr-nav a")).filter(function(el){return el.offsetParent!==null||el===btn;});
var i=f.indexOf(document.activeElement);
if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus();}
else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus();}
});
var closeOnWide=function(){if(mq.matches)set(false,false);};
if(mq.addEventListener)mq.addEventListener("change",closeOnWide);else mq.addListener(closeOnWide);
window.addEventListener("pageshow",function(){set(false,false);});
}
consent();chrome();burger();activeNav();reel();handwriting();
})();
