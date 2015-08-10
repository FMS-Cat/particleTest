#ifdef GL_ES
precision mediump float;
#endif

uniform float particleSize;
uniform sampler2D particleTexture;

void main(){
  vec2 uv = gl_FragCoord.xy / vec2( 4.0, 1.0 ) / particleSize;
  gl_FragColor = texture2D( particleTexture, uv );
}
