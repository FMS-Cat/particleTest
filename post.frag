#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265

uniform float time;
uniform vec2 resolution;
uniform sampler2D renderTexture;

void rect(vec4 _p,vec3 _c)
{
	vec2 p=gl_FragCoord.xy;
    if((_p.x<p.x&&p.x<_p.x+_p.z&&_p.y<p.y&&p.y<_p.y+_p.w))gl_FragColor=vec4(_c,1.0);
}

void print(float _i,vec2 _f,vec2 _p,vec3 _c)
{
    bool n=(_i<0.)?true:false;
    _i=abs(_i);
    if(gl_FragCoord.x<_p.x-5.-(max(ceil(log(_i)/log(10.)),_f.x)+(n?1.:0.))*30.||_p.x+6.+_f.y*30.<gl_FragCoord.x||gl_FragCoord.y<_p.y||_p.y+31.<gl_FragCoord.y)return;

    if(0.<_f.y){rect(vec4(_p.x-5.,_p.y,11.,11.),vec3(1.));rect(vec4(_p.x-4.,_p.y+1.,9.,9.),_c);}

    float c=-_f.y,m=0.;
    for(int i=0;i<16;i++)
    {
        float x,y=_p.y;
        if(0.<=c){x=_p.x-35.-30.*c;}
        else{x=_p.x-25.-30.*c;}
        if(int(_f.x)<=int(c)&&_i/pow(10.,c)<1.&&0.<c)
        {
            if(n){rect(vec4(x,y+10.,31.,11.),vec3(1.));rect(vec4(x+1.,y+11.,29.,9.),_c);}
            break;
        }
        float l=fract(_i/pow(10.,c+1.));
        if(l<.1){rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+15.,y+10.,1.,11.),vec3(1.));}
        else if(l<.2){rect(vec4(x+5.,y,21.,31.),vec3(1.));rect(vec4(x,y,31.,11.),vec3(1.));rect(vec4(x,y+20.,6.,11.),vec3(1.));rect(vec4(x+6.,y+1.,19.,29.),_c);rect(vec4(x+1.,y+1.,29.,9.),_c);rect(vec4(x+1.,y+21.,5.,9.),_c);}
        else if(l<.3){rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+15.,y+10.,15.,1.),vec3(1.));rect(vec4(x+1.,y+20.,15.,1.),vec3(1.));}
        else if(l<.4){rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+1.,y+10.,15.,1.),vec3(1.));rect(vec4(x+1.,y+20.,15.,1.),vec3(1.));}
        else if(l<.5){rect(vec4(x,y+5.,15.,26.),vec3(1.));rect(vec4(x+15.,y,16.,31.),vec3(1.));rect(vec4(x+1.,y+6.,14.,24.),_c);rect(vec4(x+16.,y+1.,14.,29.),_c);rect(vec4(x+15.,y+6.,1.,10.),_c);}
        else if(l<.6){rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+1.,y+10.,15.,1.),vec3(1.));rect(vec4(x+15.,y+20.,15.,1.),vec3(1.));}
        else if(l<.7){rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+10.,y+10.,11.,1.),vec3(1.));rect(vec4(x+10.,y+20.,20.,1.),vec3(1.));}
        else if(l<.8){rect(vec4(x,y+10.,15.,21.),vec3(1.));rect(vec4(x+15.,y,16.,31.),vec3(1.));rect(vec4(x+1.,y+11.,14.,19.),_c);rect(vec4(x+16.,y+1.,14.,29.),_c);rect(vec4(x+15.,y+20.,1.,10.),_c);}
        else if(l<.9){rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+10.,y+10.,11.,1.),vec3(1.));rect(vec4(x+10.,y+20.,11.,1.),vec3(1.));}
        else{rect(vec4(x,y,31.,31.),vec3(1.));rect(vec4(x+1.,y+1.,29.,29.),_c);rect(vec4(x+1.,y+10.,20.,1.),vec3(1.));rect(vec4(x+10.,y+20.,11.,1.),vec3(1.));}
        c+=1.;
    }
}

mat4 perspective( float _fov, float _aspect, float _near, float _far ){
  float p = 1.0 / tan( _fov * PI / 180.0 / 2.0 );
  float d = _far / ( _far - _near );
  return mat4(
    p / _aspect, 0.0, 0.0, 0.0,
    0.0, p, 0.0, 0.0,
    0.0, 0.0, d, 1.0,
    0.0, 0.0, -_near * 2.0 * d, 0.0
  );
}

float hash( vec2 _v ){
  return fract( sin( dot( vec3( _v, sin( mod( time, 30.0 ) * 18775.24 ) ), vec3( 1617.295, 1282.446, 9876.54 ) ) ) * 17285.998 );
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 tex = texture2D( renderTexture, uv );
  vec3 sum = tex.xyz;
  for( float i=-29.0; i<29.5; i+=1.0 ){
    vec2 uva = uv + vec2( i * 0.004, 0.0 );
    if( abs( uva.x - 0.5 ) < 0.5 && abs( uva.y - 0.5 ) < 0.5 ){
      vec3 texa = texture2D( renderTexture, uva ).xyz;
      sum += texa * 0.01 * exp( -abs( i ) );
    }
  }
  gl_FragColor = vec4( sum * 1.0, 1.0 );
}
