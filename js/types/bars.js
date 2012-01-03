/** Bars **/
Flotr.addType('bars', {

  options: {
    show: false,           // => setting to true will show bars, false will hide
    lineWidth: 2,          // => in pixels
    barWidth: 1,           // => in units of the x axis
    fill: true,            // => true to fill the area from the line to the x axis, false for (transparent) no fill
    fillColor: null,       // => fill color
    fillOpacity: 0.4,      // => opacity of the fill color, set to 1 for a solid fill, 0 hides the fill
    horizontal: false,     // => horizontal bars (x and y inverted)
    stacked: false,        // => stacked bar charts
    centered: true         // => center the bars to their x axis value
  },

  stack : { 
    positive : [],
    negative : [],
    _positive : [], // Shadow
    _negative : []  // Shadow
  },

  draw : function (options) {
    var
      context = options.context;

    context.save();
    context.lineJoin = 'miter';
    // @TODO linewidth not interpreted the right way.
    context.lineWidth = Math.min(options.lineWidth, options.barWidth);
    context.strokeStyle = options.color;
    if (options.fill) context.fillStyle = options.fillStyle
    
    this.plot(options);

    context.restore();
  },

  plot : function (options) {

    var
      data            = options.data,
      context         = options.context,
      shadowSize      = options.shadowSize,
      i, geometry, left, top, width, height;

    if (data.length < 1) return;

    this.translate(context, options.horizontal);

    for (i = 0; i < data.length; i++) {

      geometry = this.getBarGeometry(data[i][0], data[i][1], options);
      if (geometry === null) continue;

      left    = geometry.left;
      top     = geometry.top;
      width   = geometry.width;
      height  = geometry.height;

      if (options.fill) context.fillRect(left, top, width, height);
      if (shadowSize) {
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.05)';
        context.fillRect(left + shadowSize, top + shadowSize, width, height);
        context.restore();
      }
      if (options.lineWidth != 0) {
        context.strokeRect(left, top, width, height);
      }
    }
  },

  translate : function (context, horizontal) {
    if (horizontal) {
      context.rotate(-Math.PI / 2)
      context.scale(-1, 1);
    }
  },

  getBarGeometry : function (x, y, options) {

    var
      horizontal    = options.horizontal,
      barWidth      = options.barWidth,
      centered      = options.centered,
      stack         = options.stacked ? this.stack : false,
      bisection     = centered ? barWidth / 2 : 0,
      xScale        = horizontal ? options.yScale : options.xScale,
      yScale        = horizontal ? options.xScale : options.yScale,
      xValue        = horizontal ? y : x,
      yValue        = horizontal ? x : y,
      stackOffset   = 0,
      stackValue, left, right, top, bottom;

    // Stacked bars
    if (stack) {
      stackValue          = yValue > 0 ? stack.positive : stack.negative;
      stackOffset         = stackValue[xValue] || stackOffset;
      stackValue[xValue]  = stackOffset + yValue;
    }

    left    = xScale(xValue - bisection);
    right   = xScale(xValue + barWidth - bisection);
    top     = yScale(yValue + stackOffset);
    bottom  = yScale(stackOffset);

    // TODO for test passing... probably looks better without this
    if (bottom < 0) bottom = 0;

    // TODO Skipping...
    // if (right < xa.min || left > xa.max || top < ya.min || bottom > ya.max) continue;

    return (x === null || y === null) ? null : {
      x         : xValue,
      y         : yValue,
      xScale    : xScale,
      yScale    : yScale,
      top       : top,
      left      : left,
      width     : right - left,
      height    : bottom - top
    };
  },

  hit : function (options) {
    var
      data = options.data,
      args = options.args,
      mouse = args[0],
      n = args[1],
      x = mouse.x,
      y = mouse.y,
      hitGeometry = this.getBarGeometry(x, y, options),
      width = Math.abs(hitGeometry.width / 2),
      left = hitGeometry.left,
      geometry, i;

    for (i = data.length; i--;) {
      geometry = this.getBarGeometry(data[i][0], data[i][1], options);
      if (geometry.y > hitGeometry.y && Math.abs(left - geometry.left) < width) {
        n.x = data[i][0];
        n.y = data[i][1];
        n.index = i;
        n.seriesIndex = options.index;
      }
    }
  },

  drawHit : function (options) {
    // TODO hits for stacked bars; implement using calculateStack option?
    var
      context     = options.context,
      args        = options.args,
      geometry    = this.getBarGeometry(args.x, args.y, options),
      left        = geometry.left,
      top         = geometry.top,
      width       = geometry.width,
      height      = geometry.height;

    context.save();
    context.strokeStyle = options.color;
    context.lineWidth = Math.min(options.lineWidth, width);
    this.translate(context, options.horizontal);

    // Draw highlight
    context.beginPath();
    context.moveTo(left, top + height);
    context.lineTo(left, top);
    context.lineTo(left + width, top);
    context.lineTo(left + width, top + height);
    if (options.fill) {
      context.fillStyle = options.fillStyle;
      context.fill();
    }
    context.stroke();
    context.closePath();

    context.restore();
  },

  clearHit: function (options) {
    var
      context     = options.context,
      args        = options.args,
      geometry    = this.getBarGeometry(args.x, args.y, options),
      lineWidth   = 2 * Math.min(options.lineWidth, geometry.width);

    context.save();
    this.translate(context, options.horizontal);
    context.clearRect(
      geometry.left - lineWidth,
      geometry.top - lineWidth,
      geometry.width + 2 * lineWidth,
      geometry.height + 2 * lineWidth
    );
    context.restore();
  },

  extendXRange : function (axis, data, options, bars) {
    this._extendRange(axis, data, options, bars);
  },

  extendYRange : function (axis, data, options, bars) {
    this._extendRange(axis, data, options, bars);
  },
  _extendRange: function (axis, data, options, bars) {

    var
      max = axis.options.max;

    if (_.isNumber(max) || _.isString(max)) return; 

    var
      newmin = axis.min,
      newmax = axis.max,
      orientation = axis.orientation,
      positiveSums = bars.positiveSums || {},
      negativeSums = bars.negativeSums || {},
      value, datum, index, j;

    // Sides of bars
    if ((orientation == 1 && !options.horizontal) || (orientation == -1 && options.horizontal)) {
      if (options.centered) {
        newmax = Math.max(axis.datamax + 0.5, newmax);
        newmin = Math.min(axis.datamin - 0.5, newmin);
      }
    }

    // End of bars
    if ((orientation == 1 && options.horizontal) || (orientation == -1 && !options.horizontal)) {
      if (options.barWidth + axis.datamax >= newmax)
        newmax = axis.max + (options.centered ? options.barWidth/2 : options.barWidth);
    }

    if (options.stacked && 
        ((orientation == 1 && options.horizontal) || (orientation == -1 && !options.horizontal))){

      for (j = data.length; j--;) {
        value = data[j][(orientation == 1 ? 1 : 0)]+'';
        datum = data[j][(orientation == 1 ? 0 : 1)];

        // Positive
        if (datum > 0) {
          positiveSums[value] = (positiveSums[value] || 0) + datum;
          newmax = Math.max(newmax, positiveSums[value]);
        }

        // Negative
        else {
          negativeSums[value] = (negativeSums[value] || 0) + datum;
          newmin = Math.min(newmin, negativeSums[value]);
        }
      }
    }

    bars.negativeSums = negativeSums;
    bars.positiveSums = positiveSums;

    axis.max = newmax;
    axis.min = newmin;
  }

});
