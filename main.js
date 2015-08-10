var beginTime = ( +new Date() );
var frame = 0;

var canvas = document.createElement( 'canvas' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var particleSize = 256;

var gl = canvas.getContext( 'webgl' );
var floatExtension = gl.getExtension( 'OES_texture_float' );
document.body.appendChild( canvas );

gl.enable( gl.DEPTH_TEST );
gl.depthFunc( gl.LEQUAL );
gl.enable( gl.BLEND );
gl.blendEquation( gl.FUNC_ADD );
gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

// ----------

var createProgram = function( _vert, _frag ){
	var vert = gl.createShader( gl.VERTEX_SHADER );
	gl.shaderSource( vert, _vert );
	gl.compileShader( vert );
	if( !gl.getShaderParameter( vert, gl.COMPILE_STATUS ) ){
		alert( gl.getShaderInfoLog( vert ) );
		return null;
	}

	var frag = gl.createShader( gl.FRAGMENT_SHADER );
	gl.shaderSource( frag, _frag );
	gl.compileShader( frag );
	if(!gl.getShaderParameter( frag, gl.COMPILE_STATUS ) ){
		alert( gl.getShaderInfoLog( frag ) );
		return null;
	}

	var program = gl.createProgram();
	gl.attachShader( program, vert );
	gl.attachShader( program, frag );
	gl.linkProgram( program );
	if( gl.getProgramParameter( program, gl.LINK_STATUS ) ){
    program.locations = {};
		return program;
	}else{
		alert( gl.getProgramInfoLog( program ) );
		return null;
	}
};

var createVertexbuffer = function( _array ){
  var buffer = gl.createBuffer();

  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( _array ), gl.STATIC_DRAW );
  gl.bindBuffer( gl.ARRAY_BUFFER, null );

  buffer.length = _array.length;
  return buffer;
}

var attribute = function( _program, _name, _buffer, _stride ){
  var location;
  if( _program.locations[ _name ] ){
    location = _program.locations[ _name ];
  }else{
    location = gl.getAttribLocation( _program, _name );
    _program.locations[ _name ] = location;
  }

  gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
  gl.enableVertexAttribArray( location );
  gl.vertexAttribPointer( location, _stride, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, null );
};

var createTexture = function(){
	var texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.bindTexture( gl.TEXTURE_2D, null );

	return texture;
};

var setTexture = function( _texture, _image ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var setTextureFromArray = function( _texture, _width, _height, _array ){
	gl.bindTexture( gl.TEXTURE_2D, _texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array( _array ) );
	gl.bindTexture( gl.TEXTURE_2D, null );
};

var createFramebuffer = function( _width, _height ){
  var framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );

  framebuffer.texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, framebuffer.texture );
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0 );

  gl.bindTexture( gl.TEXTURE_2D, null );
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );

  return framebuffer;
};

// ----------

var particleVert;
requestText( 'particle.vert', function( _text ){
	particleVert = _text;
	go();
} );

var particleFrag;
requestText( 'particle.frag', function( _text ){
	particleFrag = _text;
	go();
} );

var renderVert;
requestText( 'render.vert', function( _text ){
	renderVert = _text;
	go();
} );

var renderFrag;
requestText( 'render.frag', function( _text ){
	renderFrag = _text;
	go();
} );

var postVert;
requestText( 'post.vert', function( _text ){
	postVert = _text;
	go();
} );

var postFrag;
requestText( 'post.frag', function( _text ){
	postFrag = _text;
	go();
} );

var returnVert;
requestText( 'return.vert', function( _text ){
	returnVert = _text;
	go();
} );

var returnFrag;
requestText( 'return.frag', function( _text ){
	returnFrag = _text;
	go();
} );

var image = new Image();
image.size = 128;
image.canvas = document.createElement( 'canvas' );
image.canvas.width = image.size;
image.canvas.height = image.size;
image.context = image.canvas.getContext( '2d' );
image.array = [];
image.array[0] = [];
image.array[1] = [];
image.onload = function(){
	image.context.drawImage( image, 0, 0, image.size, image.size );
	var imageData = image.context.getImageData( 0, 0, image.size, image.size );
	for( var i=0; i<image.size*image.size; i++ ){
		if( 127 < imageData.data[ i*4+3 ] ){
			image.array[0].push( i % image.size );
			image.array[1].push( Math.floor( i / image.size ) );
		}
	}
	go();
};
image.src = 'image.png';

// ----------

var go = function(){
	var it = this;

	if( !it.count ){ it.count = 9; }

	it.count -= 1;
	if( it.count === 0 ){
		var quadVBO = createVertexbuffer( [-1,-1,0,1,-1,0,1,1,0,-1,-1,0,1,1,0,-1,1,0] );
		var uvVBO = createVertexbuffer( ( function(){
			var a = [];
			for( var iy=0; iy<particleSize; iy++ ){
				for( var ix=0; ix<particleSize; ix++ ){
					a.push( ix );
					a.push( iy );
				}
			}
			return a;
		} )() );

		var particleFramebuffer = createFramebuffer( particleSize * 4, particleSize );
		var renderFramebuffer = createFramebuffer( canvas.width, canvas.height );
		var returnFramebuffer = createFramebuffer( particleSize * 4, particleSize );

		var initialTexture = createTexture( particleSize * 4, particleSize );
		setTextureFromArray( initialTexture, particleSize * 4, particleSize, ( function(){
			var a = [];
			for( var i=0; i<particleSize*particleSize; i++ ){
				var ii = i % ( image.array[0].length );
				if( i % 100 === 0 ){ console.log( i + ' , ' + ii ); }
				a.push( image.array[0][ii] / image.size * 2.0 - 1.0 );
				a.push( 1.0 - image.array[1][ii] / image.size * 2.0 );
				a.push( ( Math.random() - 0.5 ) * 0.2 );
				a.push( Math.random() );

				a.push( Math.random() - 0.5 );
				a.push( Math.random() - 0.5 );
				a.push( Math.random() - 0.5 );
				a.push( Math.random() );

				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );

				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );
				a.push( Math.random() );
			}
			console.log( a.length );
			return a;
		} )() );
		var initial = 0.1;

		var particleProgram = createProgram( particleVert, particleFrag );
		particleProgram.locations[ 'time' ] = gl.getUniformLocation( particleProgram, 'time' );
		particleProgram.locations[ 'frame' ] = gl.getUniformLocation( particleProgram, 'frame' );
		particleProgram.locations[ 'particleSize' ] = gl.getUniformLocation( particleProgram, 'particleSize' );
		particleProgram.locations[ 'initial' ] = gl.getUniformLocation( particleProgram, 'initial' );
		particleProgram.locations[ 'particleTexture' ] = gl.getUniformLocation( particleProgram, 'particleTexture' );
		particleProgram.locations[ 'initialTexture' ] = gl.getUniformLocation( particleProgram, 'initialTexture' );

		var renderProgram = createProgram( renderVert, renderFrag );
		renderProgram.locations[ 'time' ] = gl.getUniformLocation( renderProgram, 'time' );
		renderProgram.locations[ 'resolution' ] = gl.getUniformLocation( renderProgram, 'resolution' );
		renderProgram.locations[ 'particleSize' ] = gl.getUniformLocation( renderProgram, 'particleSize' );
		renderProgram.locations[ 'particleTexture' ] = gl.getUniformLocation( renderProgram, 'particleTexture' );

		var postProgram = createProgram( postVert, postFrag );
		postProgram.locations[ 'time' ] = gl.getUniformLocation( postProgram, 'time' );
		postProgram.locations[ 'resolution' ] = gl.getUniformLocation( postProgram, 'resolution' );
		renderProgram.locations[ 'renderTexture' ] = gl.getUniformLocation( renderProgram, 'renderTexture' );

		var returnProgram = createProgram( returnVert, returnFrag );
		returnProgram.locations[ 'particleSize' ] = gl.getUniformLocation( returnProgram, 'particleSize' );
		returnProgram.locations[ 'particleTexture' ] = gl.getUniformLocation( returnProgram, 'particleTexture' );

		// ----------

		var update = function(){
			var time = ( ( +new Date() ) - beginTime ) * 0.001;
			frame ++;

			// pass 1 (particle)
			( function(){
				gl.useProgram( particleProgram );
			  gl.bindFramebuffer( gl.FRAMEBUFFER, particleFramebuffer );
				gl.viewport( 0, 0, particleSize * 4.0, particleSize );

			  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			  gl.clearDepth( 1.0 );
			  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( particleProgram, 'position', quadVBO, 3 );

				gl.uniform1f( particleProgram.locations[ 'time' ], time );
				gl.uniform1f( particleProgram.locations[ 'frame' ], frame );
				gl.uniform1f( particleProgram.locations[ 'particleSize' ], particleSize );
				gl.uniform1f( particleProgram.locations[ 'initial' ], initial );

				gl.activeTexture( gl.TEXTURE0 );
				gl.bindTexture( gl.TEXTURE_2D, returnFramebuffer.texture );
		  	gl.uniform1i( particleProgram.locations[ 'particleTexture' ], 0 );

				gl.activeTexture( gl.TEXTURE1 );
				gl.bindTexture( gl.TEXTURE_2D, initialTexture );
				gl.uniform1i( particleProgram.locations[ 'initialTexture' ], 1 );

			  gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

			// pass 2 (render)
			( function(){
				gl.useProgram( renderProgram );
			  gl.bindFramebuffer( gl.FRAMEBUFFER, renderFramebuffer );
				gl.viewport( 0, 0, canvas.width, canvas.height );

			  gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
			  gl.clearDepth( 1.0 );
			  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( renderProgram, 'uv', uvVBO, 2 );

				gl.uniform1f( renderProgram.locations[ 'time' ], time );
				gl.uniform2fv( renderProgram.locations[ 'resolution' ], [ canvas.width, canvas.height ] );
				gl.uniform1f( renderProgram.locations[ 'particleSize' ], particleSize );

				gl.activeTexture( gl.TEXTURE0 );
				gl.bindTexture( gl.TEXTURE_2D, particleFramebuffer.texture );
				gl.uniform1i( renderProgram.locations[ 'particleTexture' ], 0 );

			  gl.drawArrays( gl.POINTS, 0, uvVBO.length / 2 );
			} )();

			// pass 3 (post)
			( function(){
				gl.useProgram( postProgram );
				gl.bindFramebuffer( gl.FRAMEBUFFER, null );
				gl.viewport( 0, 0, canvas.width, canvas.height );

				gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
				gl.clearDepth( 1.0 );
				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( postProgram, 'position', quadVBO, 3 );

				gl.uniform2fv( postProgram.locations[ 'resolution' ], [ canvas.width, canvas.height ] );

				gl.activeTexture( gl.TEXTURE0 );
				gl.bindTexture( gl.TEXTURE_2D, renderFramebuffer.texture );
				gl.uniform1i( postProgram.locations[ 'particleTexture' ], 0 );

				gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

			// pass 4 (return)
			( function(){
				gl.useProgram( returnProgram );
				gl.bindFramebuffer( gl.FRAMEBUFFER, returnFramebuffer );
				gl.viewport( 0, 0, particleSize * 4.0, particleSize );

				gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
				gl.clearDepth( 1.0 );
				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

				attribute( returnProgram, 'position', quadVBO, 3 );

				gl.uniform1f( returnProgram.locations[ 'particleSize' ], particleSize );

				gl.activeTexture( gl.TEXTURE0 );
				gl.bindTexture( gl.TEXTURE_2D, particleFramebuffer.texture );
				gl.uniform1i( returnProgram.locations[ 'particleTexture' ], 0 );

				gl.drawArrays( gl.TRIANGLES, 0, quadVBO.length / 3 );
			} )();

		  gl.flush();
		  requestAnimationFrame( update );
		};
		requestAnimationFrame( update );
	}
};
