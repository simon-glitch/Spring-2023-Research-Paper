const FLOAT_LENGTH=64,EXP_LENGTH=11,MAX_EXP=1023,MAN_LENGTH=52,MAX_INT_EXP=52,MAX_INT=4503599627370496,MAX_SAFE_INT=MAX_INT-1,MIN_NON_ZERO_EXP=-1074,MIN_NON_ZERO=2**MIN_NON_ZERO_EXP,MAX_NON_INFINITY=MAX_SAFE_INT*2**971,HALF_INFINITY=898846567431158e293;
let bincexp=2,binc=2**bincexp;
SCOPE_IEEE64:{
  let $=898846567431158e293,e=51,r=50,t=2**r,_=2**e,n=(MAX_INT-1)/MAX_INT,o=MAX_INT-1;var a,l,c=function($){var e=function(){if(0==$)return 0;if(!isFinite($))return $=0,2047;if(isNaN($)){$=n;return}let e=1024;for(;$>1;e++)$/=2;for(;$<1;e--)$*=2;return e};let r=Number($<0),_;return($*=(-1)**r)<MIN_NON_ZERO?(_=0,$*=898846567431158e293,$+=1,$*=t):(_=e(),$*=MAX_INT),r+" "+(2048+_).toString(2).slice(1)+" "+$.toString(2).slice(1)},random=function($,e){return Math.round((e-$)*Math.random()+$)};(a=function($){var e=function(){if($==NaN)return $=o,2047;let e=Math.floor(Math.log2($)),r=e-52+1;return r<1024?$/=2**r:($/=2**e,$*=_),e+=1024};let r=Number($<0),n;return($*=(-1)**r)<MIN_NON_ZERO?(n=0,$*=898846567431158e293,$+=1,$*=t):n=e(),r+" "+(2048+n).toString(2).slice(1)+" "+$.toString(2).slice(1)}).name="toStringIEEE64",Number.prototype.toStringIEEE64=a
}
var get_digits=function($){
  let e=MAX_INT,r=0,t=e%$,_=[],n=[];for(_[r]=t,r=0;r<$;r++)n[r]=0;for(r=1,n[t]=1;r<40&&(e-=t,e/=$,t=e%$,_[r]=t,!(e<$)||!n[t]);r++)n[t]=1;return _},err=function($,e){let r=Error();return r.name=$,r.message=e,r},random=function $(e,r,t,_,n,o){if(e>MAX_INT)return err("RangeError","n   is too large!");if(r>MAX_INT)return err("RangeError","max is too large!");_=_||Math.log2(r);let a=t||[],l,c,i=0,s=0,f=0,u=Math.floor(52/_);for(l=0;l<e;l){if(digit_offset=0,s=MAX_INT*Math.random(),o&&console.log("rand: "+BigInt(s)),o&&console.log({i:l,n:e}),f=Math.min(u,e-l),o&&console.log("digits to use: "+f),o&&console.log("digits offset: "+u-f),l==e){o&&console.log("weird break!!!");break}for(c=0;c<f;c++)i=s%r,a[l]=i,l++,s-=i,s/=r}return a
};
var randomn=function $(e,r,t,_){
  if(_=_||1,(e=Math.floor(e))<1)return[];let n=random(e,Math.ceil((t-r)/_));for(let o=0;o<n.length;o++)n[o]=r+n[o]*_;return n
};
var sum=function($){
  let e=0;for(let r=0;r<$.length;r++)e+=$[r];return e
},
shuffle=function $(e,r){
  let t=function($,e,r){
    if(r){for(let t=0;t<e.length;t++)r[t]=$[e[t]];return r}let _=[];for(let n=0;n<e.length;n++)_[n]=$[e[n]];return _
  };
  let _=e.length,n=0,o=0,a;
  let
  l=function($,e){
    let r=$.constructor,t=new r($.length);switch(e){case 0:return;case 1:t[0]=$[0],t[1]=$[2],t[2]=$[1];break;case 2:t[0]=$[1],t[1]=$[0],t[2]=$[2];break;case 3:t[0]=$[1],t[1]=$[2],t[2]=$[0];break;case 4:t[0]=$[2],t[1]=$[0],t[2]=$[1];break;case 5:t[0]=$[2],t[1]=$[1],t[2]=$[0]}$[0]=t[0],$[1]=t[1],$[2]=t[2]
  },
  c=function($,e){
    let r=$.constructor,t=new r($.length);
    switch(e){
      case 0:return;case 1:t[0]=$[0],t[1]=$[3],t[2]=$[1],t[3]=$[2];break;case 2:t[0]=$[0],t[1]=$[2],t[2]=$[3],t[3]=$[1];break;case 3:t[0]=$[0],t[1]=$[2],t[2]=$[1],t[3]=$[3];break;case 4:t[0]=$[0],t[1]=$[1],t[2]=$[3],t[3]=$[2];break;case 5:t[0]=$[0],t[1]=$[1],t[2]=$[2],t[3]=$[3];break;case 6:t[0]=$[1],t[1]=$[0],t[2]=$[2],t[3]=$[3];break;case 7:t[0]=$[1],t[1]=$[0],t[2]=$[3],t[3]=$[2];break;case 8:t[0]=$[1],t[1]=$[2],t[2]=$[0],t[3]=$[3];break;case 9:t[0]=$[1],t[1]=$[2],t[2]=$[3],t[3]=$[0];break;case 10:t[0]=$[1],t[1]=$[3],t[2]=$[0],t[3]=$[2];break;case 11:t[0]=$[1],t[1]=$[3],t[2]=$[2],t[3]=$[0];break;case 12:t[0]=$[2],t[1]=$[0],t[2]=$[3],t[3]=$[2];break;case 13:t[0]=$[2],t[1]=$[0],t[2]=$[3],t[3]=$[1];break;case 14:t[0]=$[2],t[1]=$[1],t[2]=$[0],t[3]=$[3];break;case 15:t[0]=$[2],t[1]=$[1],t[2]=$[3],t[3]=$[0];break;case 16:t[0]=$[2],t[1]=$[3],t[2]=$[0],t[3]=$[1];break;case 17:t[0]=$[2],t[1]=$[3],t[2]=$[1],t[3]=$[0];break;case 18:t[0]=$[3],t[1]=$[0],t[2]=$[1],t[3]=$[2];break;case 19:t[0]=$[3],t[1]=$[0],t[2]=$[2],t[3]=$[1];break;case 20:t[0]=$[3],t[1]=$[1],t[2]=$[0],t[3]=$[2];break;case 21:t[0]=$[3],t[1]=$[1],t[2]=$[2],t[3]=$[0];break;case 22:t[0]=$[3],t[1]=$[2],t[2]=$[0],t[3]=$[1];break;case 23:t[0]=$[3],t[1]=$[2],t[2]=$[1],t[3]=$[0]
    }
    $[0]=t[0],$[1]=t[1],$[2]=t[2],$[3]=t[3]
  },
  $=function($){
    let e=$.length,r;r=new Uint32Array(e);let t=r;for(let _=0;_<e;_++)t[_]=_;return a(t),t
  };
  a=function(e){
    if(o=Math.max(o,++n),n>1e6){console.log("exceeded depth"),console.log("err list:",e);let r=new InternalError;throw r.message="Somehow had "+n+" layers of recursion! (on a list with only "+_+" items in it)",r}let a=e.length,i=!1;if(a<2&&(i=!0),2==a){if(.5>Math.random())i=!0;else{let s=e[0];e[0]=e[1],e[1]=s;return}}if(3==a&&(l(e,random(1,6)[0]),i=!0),4==a&&(c(e,random(1,24)[0]),i=!0),!i){let f=0;for(;0==f;){let u=Array(a),N=random(a+1,2);for(let g=0,b;g<a;g++)(b=N[g]<1)?(u[g]=!0,f++):u[g]=!1;if(0==f)continue;let k=a-f,I=new Uint32Array(f),E=new Uint32Array(k);for(let d=0,M=0,m=0;d<a;d++)u[d]?(I[M]=d,M++):(E[m]=d,m++);I=t(I,$(I),new Uint32Array(f)),E=t(E,$(E),new Uint32Array(k));if(N[a]<1){let A=I;I=E,E=A,A=f,f=k,k=A}for(let X=0;X<f;X++)e[X]=I[X];for(let h=0,T=f;h<k;h++,T++)e[T]=E[h]}}n--
  };
  let i=$(e),s=e.constructor;return console.log("highest rd: ",o),t(e,i,new s(_))
};

