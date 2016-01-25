
// KRET: Kolorful Roids Eviscerating Taxonomy

var currentCanvas, backCanvas, canvas1, canvas2;
var ctx1, ctx2;
var canvasImageData;
var cidData;
var i;

var X_MAX = 600;
var Y_MAX = 600;
var PIX_COMPOSITE_MAX = X_MAX * Y_MAX * 4;
var BOARD_MAX = X_MAX * Y_MAX;
var TWO_PI = 2 * Math.PI;
var RADIUS = 3;
var FADE_FACTOR = 0.5;

var directions = [
    [ 0,  1],
    [ 0, -1],
    [ 1,  0],
    [-1,  0],
    [ 1,  1],
    [-1, -1],
    [ 1, -1],
    [-1,  1],
];

var krets = new Set();
var boardTrace = new Array( BOARD_MAX );
var board = new Array( BOARD_MAX );

function Kret(x, y, str, dex, hp) {
  this.x = parseInt(x);
  this.y = parseInt(y);
  this.str = parseInt(str);
  this.dex = parseInt(dex);
  this.hp = parseInt(hp);
}

function fadeCanvas() {
    for( var index = 3; index < PIX_COMPOSITE_MAX; index += 4 ) {
        cidData[index] *= 0.5;
        //cidData[index] = 0;
    }
}

function drawPixel( x, y, r, g, b, a ) {
    var index = (x + y * X_MAX) * 4;

    cidData[index  ] = r;
    cidData[index+1] = g;
    cidData[index+2] = b;
    cidData[index+3] = a;
}

function circle( x, y, radius, r, g, b ) {
    ctx.beginPath();
    var gradient = ctx.createRadialGradient( x, y, 1, x, y, radius );
    var rgb = "rgba( " + r + ", " + g + ", " + b;
    gradient.addColorStop( 0, rgb + ", 1 )" );
    gradient.addColorStop( 1, rgb + ", 0 )" );
    ctx.fillStyle = gradient;
    ctx.arc( x, y, radius, 0, TWO_PI );
    ctx.fill();
}

function getTrace( x, y ) {
    if ( x >= X_MAX ) {
        x -= X_MAX;
    } else if ( x < 0 ) {
        x += X_MAX;
    }
    if ( y >= Y_MAX ) {
        y -= Y_MAX;
    } else if ( y < 0 ) {
        y += Y_MAX;
    }
    var ret = boardTrace[x + y * X_MAX];
    return ( ret === undefined ) ? 0 : ret;
}

document.addEventListener( "DOMContentLoaded", function() { 
    document.title = "KRET init";
    
	canvas1 = document.getElementById( "renderCanvas1" );
	canvas1.width = X_MAX;
	canvas1.height = Y_MAX;

	canvas2 = document.getElementById( "renderCanvas2" );
	canvas2.width = X_MAX;
	canvas2.height = Y_MAX;
	
	currentCanvas = canvas1;
	backCanvas = canvas2;
	backCanvas.style.display = "none";
    
    i = 0;
	window.setInterval( function() {
	    var tmp = currentCanvas;
	    currentCanvas = backCanvas;
	    backCanvas = tmp;
	    
	    currentCanvas.style.display = "initial";
        backCanvas.style.display = "none";
	    
	    ctx = currentCanvas.getContext("2d");
	    ctx.clearRect( 0, 0, X_MAX, Y_MAX );
	    ctx.globalAlpha = 0.5;
	    ctx.drawImage( backCanvas, 0, 0 );
	    ctx.globalAlpha = 1;
	    
	    for( var i2 = 0; i2 < BOARD_MAX; i2++ ) {
	        if ( boardTrace[i2] !== undefined ) {
	            boardTrace[i2] *= FADE_FACTOR;
	        }
	    }
	
	    var req = new XMLHttpRequest();
		req.open( "GET", "http://ohmydeer.pl/rng.php?sep=%2C", false ); // false for synchronous request
		req.send( null );
		var split = req.responseText.split(",");
		var kret = new Kret( Math.floor( Math.random() * ( X_MAX + 1 ) ), Math.floor( Math.random() * ( Y_MAX + 1 ) ),
		  split[0], split[1], split[2] );
		krets.add( kret );
		krets.forEach( function(kret) {
		    var x = kret.x, y = kret.y;
		    var offset = x + y * X_MAX;
		    if ( boardTrace[offset] !== undefined ) {
	            boardTrace[offset] += 1;
	        } else {
	            boardTrace[offset] = 1;
	        }
		    
		    var boardSum = 0;
		    var bb = [];
		    for( var i3 = 0, max = directions.length; i3 < max; i3++ ) {
		        var direction = directions[i3];
		        var x2 = x + direction[0];
		        var y2 = y + direction[1];
		        var v = getTrace( x2, y2 ) + Math.random();
		        boardSum += v;
		        bb.push( v );
		    }
		    var boardResult = Math.random() * boardSum;
		    var resultSum = 0;
		    var newX, newY;
		    for( var i3 = 0, max = directions.length; i3 < max; i3++ ) {
		        var direction = directions[i3];
		        var newX = x + direction[0];
		        var newY = y + direction[1];
		        resultSum += bb.shift();
		        if ( boardResult < resultSum ) {
		            break;
		        }
		    }
	        if ( newX >= X_MAX ) {
                newX -= X_MAX;
            } else if ( newX < 0 ) {
                newX+= X_MAX;
            }
            if ( newY >= Y_MAX ) {
                newY -= Y_MAX;
            } else if ( newY < 0 ) {
                newY += Y_MAX;
            }
		    
		    var newOffset = newX + newY * X_MAX;
		    var targetKret = board[newOffset];
		    if ( targetKret !== undefined ) {
		        if ( Math.random() * ( 255 + 1 ) < kret.dex ) {
		            targetKret.hp -= Math.random() * ( kret.str + 1 );
		        }
		        if ( Math.random() * ( 255 + 1 ) < targetKret.dex ) {
		            kret.hp -= Math.random() * ( targetKret.str + 1 );
		        }
                if ( kret.hp <= 0 ) {
                    krets.delete( kret );
                    if ( targetKret.hp <= 0 ) {
                        krets.delete( targetKret );
                        board[newOffset] = undefined;
                    }
                } else {
                    if ( targetKret.hp <= 0 ) {
                        krets.delete( targetKret );
                        board[newOffset] = kret;
		                board[offset] = undefined;
		                kret.x = newX;
		                kret.y = newY;
                    } // else both alive, do nothing
                }
		    } else {
		        kret.x = newX;
		        kret.y = newY;
		        board[newOffset] = kret;
		        board[offset] = undefined;
		    }
		    circle( kret.x, kret.y, RADIUS, kret.str, kret.dex, Math.floor(kret.hp) );
		} );
		
		i++;
		document.title = "KRET step " + i;
		document.getElementById( "outputCount" ).textContent = krets.size;
	}, 10 );
}, false );

