#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform float frame;
uniform float particleSize;
uniform float initial;
uniform sampler2D particleTexture;
uniform sampler2D initialTexture;

float hash( vec2 _v ){
  return fract( sin( dot( vec3( _v, sin( mod( time, 30.0 ) * 18775.24 ) ), vec3( 1617.295, 1282.446, 9876.54 ) ) ) * 17285.998 );
}

void main(){
vec2 reso = vec2( 4.0, 1.0 ) * particleSize;
  vec2 uv = gl_FragCoord.xy / reso;

  float type = mod( floor( gl_FragCoord.x ), 4.0 );

  vec2 posP = uv + vec2( 0.0 - type, 0.0 ) / reso;
  vec2 velP = uv + vec2( 1.0 - type, 0.0 ) / reso;
  vec2 lifeP = uv + vec2( 2.0 - type, 0.0 ) / reso;
  vec2 nouseP = uv + vec2( 3.0 - type, 0.0 ) / reso;

  vec3 pos = texture2D( particleTexture, posP ).xyz * 0.5;
  vec3 vel = texture2D( particleTexture, velP ).xyz * 0.5;
  vec3 life = texture2D( particleTexture, lifeP ).xyz * 0.5;
  vec3 nouse = texture2D( particleTexture, nouseP ).xyz * 0.5;

  vec3 posI = texture2D( initialTexture, posP ).xyz * 0.5;
  vec3 velI = texture2D( initialTexture, velP ).xyz * 0.5;
  vec3 lifeI = texture2D( initialTexture, lifeP ).xyz * 0.5;
  vec3 nouseI = texture2D( initialTexture, nouseP ).xyz * 0.5;

  vec3 ret = vec3( 0.0 );

  if( life.x < 0.1 * hash( posP ) ){
    ret = texture2D( initialTexture, uv ).xyz * 0.5;
    if( type == 2.0 ){ ret.x = 1.0; }
  }else{
    if( type == 0.0 ){
      pos += vel * 0.01 * life.x;
      ret += pos;
    }else if( type == 1.0 ){
      ret = vel;
    }else if( type == 2.0 ){
      life.x *= exp( -life.y * 0.1 ) * 0.996;
      ret = life;
    }else{
    }
  }

  gl_FragColor = vec4( ret, 1.0 );
}
