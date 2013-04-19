/**
 * CSS gradients parser + converter to -webkit-gradient()
 * Only supports linear gradients so far
 * @author Lea Verou
 * MIT license
 */

/**
 * Create complex regexps in an easy to read way
 * @param str {String} Final regex with {{id}} for replacements
 * @param replacements {Object} Object with the replacements
 * @param flags {String} Just like the flags argument in the RegExp constructor
 */
(function(){

var linGrad = /^linear-gradient\(\s*(?:((?:(?:(?:top\s+|bottom\s+)?(?:right|left)|(?:right\s+|left\s+)?(?:top|bottom))|(?:-?[0-9]*\.?[0-9]+)deg|0))\s*,)?\s*((?:(?:(?:(?:(?:red|tan|grey|gray|lime|navy|blue|teal|aqua|cyan|gold|peru|pink|plum|snow|[a-z]{5,20}))|(?:(?:rgb|hsl)a?\((?:\s*(?:-?[0-9]*\.?[0-9]+)%?\s*,?\s*){3,4}\))|(?:#(?:[0-9a-f]{1,2}){3})))\s*(?:(?:-?[0-9]*\.?[0-9]+)(?:%|px|mm|cm|in|em|rem|en|ex|ch|vm|vw|vh)|0)?)\s*(?:,\s*(?:(?:(?:(?:(?:red|tan|grey|gray|lime|navy|blue|teal|aqua|cyan|gold|peru|pink|plum|snow|[a-z]{5,20}))|(?:(?:rgb|hsl)a?\((?:\s*(?:-?[0-9]*\.?[0-9]+)%?\s*,?\s*){3,4}\))|(?:#(?:[0-9a-f]{1,2}){3})))\s*(?:(?:-?[0-9]*\.?[0-9]+)(?:%|px|mm|cm|in|em|rem|en|ex|ch|vm|vw|vh)|0)?)\s*)+)\)$/,
	percentage = /^(?:(?:-?[0-9]*\.?[0-9]+)%|0)$/g,
	colorString = /(?:(?:(?:(?:red|tan|grey|gray|lime|navy|blue|teal|aqua|cyan|gold|peru|pink|plum|snow|[a-z]{5,20}))|(?:(?:rgb|hsl)a?\((?:\s*(?:-?[0-9]*\.?[0-9]+)%?\s*,?\s*){3,4}\))|(?:#(?:[0-9a-f]{1,2}){3})))/g,
	colorStop = /(?:(?:(?:(?:red|tan|grey|gray|lime|navy|blue|teal|aqua|cyan|gold|peru|pink|plum|snow|[a-z]{5,20}))|(?:(?:rgb|hsl)a?\((?:\s*(?:-?[0-9]*\.?[0-9]+)%?\s*,?\s*){3,4}\))|(?:#(?:[0-9a-f]{1,2}){3})))\s*(?:(?:-?[0-9]*\.?[0-9]+)(?:%|px|mm|cm|in|em|rem|en|ex|ch|vm|vw|vh)|0)?/g,
	length = /(?:-?[0-9]*\.?[0-9]+)(?:%|px|mm|cm|in|em|rem|en|ex|ch|vm|vw|vh)|0/g,
	keyword = /^(?:top\s+|bottom\s+)?(?:right|left)|(?:right\s+|left\s+)?(?:top|bottom)$/,
	args = "@{arguments}",
	// args = "linear-gradient(top left, #a6f2c0 30%, #fff 35%, rgba(180, 200, 210, .9) 90%)",
	argsArray = args.split(/,(?=\s*(?:linear|radial))/g),
	index = 0;
	max = argsArray.length,
	c = null;

var linearGradient = function (obj) {
	this.direction = obj.direction;
	this.stops = obj.stops;
	this.fromString = obj.fromString;
};

linearGradient.prototype.toWebkitGradient = function () {
	var ret = '-webkit-gradient(linear, ';
	
	// Convert direction
	if(!keyword.test(this.direction)) {
		throw new Error('The direction is an angle that can’t be converted.');
	}
	
	var dir = [0, 0, 0, 0];
	
	if(/left/i.test(this.direction)) {
		dir[2] = '100%';
	}
	else if(/right/i.test(this.direction)) {
		dir[0] = '100%';
	}
	
	if(/top/i.test(this.direction)) {
		dir[3] = '100%';
	}
	else if(/bottom/i.test(this.direction)) {
		dir[1] = '100%';
	}
	
	ret += dir[0] + ' ' + dir[1] + ', ' + dir[2] + ' ' + dir[3] + ', ';
	
	// Convert color stops
	// TODO clean up this code
	var lp = 0, implied = 0;
	
	for(var i=0; i<this.stops.length; i++) {
		var stop = this.stops[i],
			position = stop.position;
		
		if(position === null && i > 0 && i < this.stops.length - 1) {
			stop.computedPosition = null;
			implied++;
		}
		else if(i === 0 || i === this.stops.length - 1 || percentage.test(position)) {
			if(position === null && i === this.stops.length - 1) {
				stop.computedPosition = 1;
			}
			else {
				stop.computedPosition = parseFloat(position) / 100 || 0;
			}
			
			// Assign implied positions to color stops without one
			if(implied > 0) {
				var lpStop = this.stops[lp],
					lpPosition = lpStop.computedPosition,
					div = i - lp,
					increment = Math.max(0, (stop.computedPosition - lpPosition) / (i - lp));
				
				for(var j=i-1; j>lp; j--) {
					var computedPosition = Math.round(100 * (lpPosition + increment * (implied--))) / 100;
					this.stops[j].computedPosition = computedPosition;
				}
			}
			
			// If previous position is > than this, then this equals prev pos
			if(i > 0 && this.stops[i-1].computedPosition > stop.computedPosition) {
				stop.computedPosition = this.stops[i-1].computedPosition;
			}
			
			// update last positioned color stop
			lp = i;
			
		}
		else {
			throw new Error('The position of the ' + stop.color + ' color stop is not a percentage. Can’t convert.');
		}
		
	}
	
	for(var i=0; i<this.stops.length; i++) {
		var color = this.stops[i].color,
			position = this.stops[i].computedPosition;
		
		if(i === 0) {
			ret += position? 'color-stop(' + position + ', ' : 'from(';
		}
		else {
			ret += ', ' + (position < 1? 'color-stop(' + position + ', ' : 'to(');
		}
		
		ret += color + ')';
	}
	
	ret += ')';
	
	return ret;
}
	
linearGradient.prototype.toString = function () {
	return this.fromString;
}

function parse (string) {
	if(!string) {
	 	return null;
	}

	var parts = string.match(linGrad);
	
	if(!parts) {
		return null;
	}
	
	var direction = parts[1] || 'top';
		stops = parts[2].match(colorStop);
		
	var angle = parseFloat(direction);
	
	if(!isNaN(angle)) {
		angle = ((angle % 360) + 360) % 360; // to make it [0, 360)
		
		switch(angle) {
			case 0: direction = 'left';
				break;
			case 90: direction = 'bottom';
				break;
			case 180: direction = 'right';
				break;
			case 240: direction = 'top';
		}
	}
		
	for(var i=0; i<stops.length; i++) {
		var stop = stops[i],
			color = stop.match(colorString)[0],
			position = stop.substr(color.length).match(length);
		
		position = position && position[0];
		
		stops[i] = {
			color: color,
			position: position
		};
	}
	
	return new linearGradient({
		direction: direction,
		stops: stops,
		fromString: linearGradient
	});
}

while (index < max) {
	var current = argsArray[index];
	var gradient = parse(current.toString());

	argsArray[index] = gradient.toWebkitGradient();

	try {
		"".trim();
		c = !0;
	} catch (l) {
		c = !1;
	}

	if (c) {
		argsArray[index] = argsArray[index].trim();
	}

	index++;
}

return argsArray.toString().replace(/\[/g, "").replace(/\]/g, "");

})();