#ifdef GL_ES
precision mediump float;
#endif

varying float vLife;

uniform sampler2D particleTexture;

#define saturate(i) clamp(i,0.,1.)

vec3 catColor( float _theta ){
  return vec3(
    sin( _theta ),
    sin( _theta + 2.0 ),
    sin( _theta + 4.0 )
  ) * 0.5 + 0.5;
}

void main(){
  float dist = length( gl_PointCoord.xy - 0.5 );
  gl_FragColor = vec4( saturate( exp( -dist * 10.0 ) * 40.0 ) * catColor( vLife * 14.0 ), 1.0 );
//  gl_FragColor = vec4( exp( -dist * 10.0 ) * catColor( vLife * 14.0 ), 1.0 );
}
