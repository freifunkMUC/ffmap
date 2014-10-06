/* after making any changes here enter "make" in your terminal to appy the changes */

var ffmapConfig = {
  // link to your main community site:
  url:       "https://muenchen.freifunk.net",
  
  // visible link in the navigation:
  sitename:  "muenchen.freifunk.net",
  
  // initial gravity, friction, of the graph at pageload:
  gravity:   0.03,
  friction:  0.73,
  theta:     0.8,
  charge:    1.0,
  distance:  0.6,
  strength:  1.0,

  // path to the nodes.json
  nodes_json: "nodes.json",
};
function load_nodes(filename, data, fn) {
  d3.json(filename, function(json) {
    if (data) {
      // update existing nodes with new info
      // XXX inefficient data structure
      json.nodes.forEach(function(d, i) {
        var n
        data.nodes.forEach(function(x) {if (x.id == d.id) n = x})
        if (n) {
          for (var key in d)
            if (d.hasOwnProperty(key))
              n[key] = d[key]

          json.nodes[i] = n
        }
      })

      json.links.forEach(function(d, i) {
        var n
        data.links.forEach(function(x) {if (x.id == d.id) n = x})
        if (n) {
          for (var key in d)
            if (d.hasOwnProperty(key))
              n[key] = d[key]

          json.links[i] = n
        }
      })
    }

    // replace indices with real objects
    json.links.forEach( function(d) {
      if (typeof d.source == "number") d.source = json.nodes[d.source];
      if (typeof d.target == "number") d.target = json.nodes[d.target];
    })

    // count vpn links
    json.nodes.forEach(function(d) {
      d.vpns = []
      d.wifilinks = []
      d.clients = []
    })

    json.links.forEach(function(d) {
      var node, other

      if (d.type == "vpn") {
        d.source.vpns.push(d.target)
        d.target.vpns.push(d.source)
      } else if (d.type == "client") {
        d.source.clients.push(d.target)
        d.target.clients.push(d.source)
      } else {
        d.source.wifilinks.push(d.target)
        d.target.wifilinks.push(d.source)
      }
    })

    fn(json)
  })
}
var linkcolor = {'default':
                  d3.scale.linear()
                  .domain([1, 1.25, 1.5])
                  .range(["#0a3", "orange", "red"]),
                 'wifi':
                  d3.scale.linear()
                  .domain([1, 3, 10])
                  .range(["#0a3", "orange", "red"]),
                };
/*
html5slider - a JS implementation of <input type=range> for Firefox 4 and up
https://github.com/fryn/html5slider

Copyright (c) 2010-2011 Frank Yan, <http://frankyan.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {

// test for native support
var test = document.createElement('input');
try {
  test.type = 'range';
  if (test.type == 'range')
    return;
} catch (e) {
  return;
}

// test for required property support
if (!document.mozSetImageElement || !('MozAppearance' in test.style))
  return;

var scale;
var isMac = navigator.platform == 'MacIntel';
var thumb = {
  radius: isMac ? 9 : 6,
  width: isMac ? 22 : 12,
  height: isMac ? 16 : 20
};
var track = '-moz-linear-gradient(top, transparent ' + (isMac ?
  '6px, #999 6px, #999 7px, #ccc 9px, #bbb 11px, #bbb 12px, transparent 12px' :
  '9px, #999 9px, #bbb 10px, #fff 11px, transparent 11px') +
  ', transparent)';
var styles = {
  'min-width': thumb.width + 'px',
  'min-height': thumb.height + 'px',
  'max-height': thumb.height + 'px',
  padding: 0,
  border: 0,
  'border-radius': 0,
  cursor: 'default',
  'text-indent': '-999999px' // -moz-user-select: none; breaks mouse capture
};
var onChange = document.createEvent('HTMLEvents');
onChange.initEvent('change', true, false);

if (document.readyState == 'loading')
  document.addEventListener('DOMContentLoaded', initialize, true);
else
  initialize();

function initialize() {
  // create initial sliders
  Array.forEach(document.querySelectorAll('input[type=range]'), transform);
  // create sliders on-the-fly
  document.addEventListener('DOMNodeInserted', onNodeInserted, true);
}

function onNodeInserted(e) {
  check(e.target);
  if (e.target.querySelectorAll)
    Array.forEach(e.target.querySelectorAll('input'), check);
}

function check(input, async) {
  if (input.localName != 'input' || input.type == 'range');
  else if (input.getAttribute('type') == 'range')
    transform(input);
  else if (!async)
    setTimeout(check, 0, input, true);
}

function transform(slider) {

  var isValueSet, areAttrsSet, isChanged, isClick, prevValue, rawValue, prevX;
  var min, max, step, range, value = slider.value;

  // lazily create shared slider affordance
  if (!scale) {
    scale = document.body.appendChild(document.createElement('hr'));
    style(scale, {
      '-moz-appearance': isMac ? 'scale-horizontal' : 'scalethumb-horizontal',
      display: 'block',
      visibility: 'visible',
      opacity: 1,
      position: 'fixed',
      top: '-999999px'
    });
    document.mozSetImageElement('__sliderthumb__', scale);
  }

  // reimplement value and type properties
  var getValue = function() { return '' + value; };
  var setValue = function setValue(val) {
    value = '' + val;
    isValueSet = true;
    draw();
    delete slider.value;
    slider.value = value;
    slider.__defineGetter__('value', getValue);
    slider.__defineSetter__('value', setValue);
  };
  slider.__defineGetter__('value', getValue);
  slider.__defineSetter__('value', setValue);
  slider.__defineGetter__('type', function() { return 'range'; });

  // sync properties with attributes
  ['min', 'max', 'step'].forEach(function(prop) {
    if (slider.hasAttribute(prop))
      areAttrsSet = true;
    slider.__defineGetter__(prop, function() {
      return this.hasAttribute(prop) ? this.getAttribute(prop) : '';
    });
    slider.__defineSetter__(prop, function(val) {
      val === null ? this.removeAttribute(prop) : this.setAttribute(prop, val);
    });
  });

  // initialize slider
  slider.readOnly = true;
  style(slider, styles);
  update();

  slider.addEventListener('DOMAttrModified', function(e) {
    // note that value attribute only sets initial value
    if (e.attrName == 'value' && !isValueSet) {
      value = e.newValue;
      draw();
    }
    else if (~['min', 'max', 'step'].indexOf(e.attrName)) {
      update();
      areAttrsSet = true;
    }
  }, true);

  slider.addEventListener('mousedown', onDragStart, true);
  slider.addEventListener('keydown', onKeyDown, true);
  slider.addEventListener('focus', onFocus, true);
  slider.addEventListener('blur', onBlur, true);

  function onDragStart(e) {
    isClick = true;
    setTimeout(function() { isClick = false; }, 0);
    if (e.button || !range)
      return;
    var width = parseFloat(getComputedStyle(this, 0).width);
    var multiplier = (width - thumb.width) / range;
    if (!multiplier)
      return;
    // distance between click and center of thumb
    var dev = e.clientX - this.getBoundingClientRect().left - thumb.width / 2 -
              (value - min) * multiplier;
    // if click was not on thumb, move thumb to click location
    if (Math.abs(dev) > thumb.radius) {
      isChanged = true;
      this.value -= -dev / multiplier;
    }
    rawValue = value;
    prevX = e.clientX;
    this.addEventListener('mousemove', onDrag, true);
    this.addEventListener('mouseup', onDragEnd, true);
  }

  function onDrag(e) {
    var width = parseFloat(getComputedStyle(this, 0).width);
    var multiplier = (width - thumb.width) / range;
    if (!multiplier)
      return;
    rawValue += (e.clientX - prevX) / multiplier;
    prevX = e.clientX;
    isChanged = true;
    this.value = rawValue;
  }

  function onDragEnd() {
    this.removeEventListener('mousemove', onDrag, true);
    this.removeEventListener('mouseup', onDragEnd, true);
  }

  function onKeyDown(e) {
    if (e.keyCode > 36 && e.keyCode < 41) { // 37-40: left, up, right, down
      onFocus.call(this);
      isChanged = true;
      this.value = value + (e.keyCode == 38 || e.keyCode == 39 ? step : -step);
    }
  }

  function onFocus() {
    if (!isClick)
      this.style.boxShadow = !isMac ? '0 0 0 2px #fb0' :
        '0 0 2px 1px -moz-mac-focusring, inset 0 0 1px -moz-mac-focusring';
  }

  function onBlur() {
    this.style.boxShadow = '';
  }

  // determines whether value is valid number in attribute form
  function isAttrNum(value) {
    return !isNaN(value) && +value == parseFloat(value);
  }

  // validates min, max, and step attributes and redraws
  function update() {
    min = isAttrNum(slider.min) ? +slider.min : 0;
    max = isAttrNum(slider.max) ? +slider.max : 100;
    if (max < min)
      max = min > 100 ? min : 100;
    step = isAttrNum(slider.step) && slider.step > 0 ? +slider.step : 1;
    range = max - min;
    draw(true);
  }

  // recalculates value property
  function calc() {
    if (!isValueSet && !areAttrsSet)
      value = slider.getAttribute('value');
    if (!isAttrNum(value))
      value = (min + max) / 2;;
    // snap to step intervals (WebKit sometimes does not - bug?)
    value = Math.round((value - min) / step) * step + min;
    if (value < min)
      value = min;
    else if (value > max)
      value = min + ~~(range / step) * step;
  }

  // renders slider using CSS background ;)
  function draw(attrsModified) {
    calc();
    if (isChanged && value != prevValue)
      slider.dispatchEvent(onChange);
    isChanged = false;
    if (!attrsModified && value == prevValue)
      return;
    prevValue = value;
    var position = range ? (value - min) / range * 100 : 0;
    var bg = '-moz-element(#__sliderthumb__) ' + position + '% no-repeat, ';
    style(slider, { background: bg + track });
  }

}

function style(element, styles) {
  for (var prop in styles)
    element.style.setProperty(prop, styles[prop], 'important');
}

})();
var map
var svg, g

function init() {
  adjust_navigation()
  
  map = new L.Map("map", {
    worldCopyJump: true,
  })

  L.control.scale().addTo(map);

  map.addLayer(new L.TileLayer("http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg", {
    subdomains: '1234',
    type: 'osm',
    attribution: 'Map data Tiles &copy; <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" />, Map data © OpenStreetMap contributors, CC-BY-SA',
    opacity: 0.7,
  }))

  svg = d3.select(map.getPanes().overlayPane).append("svg")
  g   = svg.append("g").attr("class", "leaflet-zoom-hide")
  g.append("g").attr("class", "links")
  g.append("g").attr("class", "labels")
  g.append("g").attr("class", "nodes")

  svg.attr("width", 1000)
  svg.attr("height", 1000)

  d3.selectAll("#gpsbutton").on("click",  function() {
    function clickhandler(e) {
      var latlng = e.latlng
      prompt("Koordinaten:", e.latlng.lat + " " + e.latlng.lng)
      map.off("click", clickhandler)
    }
    var clickevent = map.on('click', clickhandler)
  })

  reload()
}

function project(x) {
  var point = map.latLngToLayerPoint(new L.LatLng(x[0], x[1]))
  return [point.x, point.y]
}

var data

function reload() {
  load_nodes(ffmapConfig.nodes_json, data, handler)

  function handler(json) {
    data = json

    update(data)
  }
}

function update(data) {
  var nodes = data.nodes.filter( function(d) {
    return d.geo != null
  })

  var links = data.links.filter( function(d) {
    return d.source.geo !== null && d.target.geo !== null && d.type != "vpn"
  })

  var t = [
    d3.extent(nodes, function (d) { return d.geo[0] }),
    d3.extent(nodes, function (d) { return d.geo[1] })
  ]

  var border = 0.0
  var bounds = [[t[0][0] - border, t[1][0] - border], [t[0][1] + border, t[1][1] + border]]


  var geocoords = /.*?\?lat=([0-9]{0,3}\.[0-9]*)&lon=([0-9]{0,3}\.[0-9]*)$/
  if ( geocoords.exec(document.URL) != null ) {
    map.setView(L.latLng(RegExp.$1,RegExp.$2),map.getMaxZoom())
  } else {
    map.fitBounds(bounds)
  }
  nodes_svg = g.select(".nodes").selectAll(".node").data(nodes, function(d) { return d.id })
  var links_svg = g.select(".links").selectAll(".link").data(links, function(d) { return d.id })

  var new_nodes = nodes_svg.enter().append("g").attr("class", "node")

  var circles = new_nodes.append("circle")
           .attr("r", "4pt")
           .attr("fill", function (d) {
             return d.flags.online?(d.firmware?"rgba(10, 150, 255, 1.0)":"rgba(0, 255, 0, 0.8)"):"rgba(128, 128, 128, 0.2)"
           })
           .on("click", function(n) { window.location.href = "graph.html#" + n.id })
           .append("title").text( function (n) { return n.name?n.name:n.id })

  links_svg.enter().append("line")
            .attr("class", "link")

  links_svg.style("stroke", function(d) {
        switch (d.type) {
          case "vpn":
            return linkcolor['default'](Math.max.apply(null, d.quality.split(",")))
          default:
            var q;
            try {
              q = Math.max.apply(null, d.quality.split(","))
            } catch(e) {
              q = d.quality
            }
            return linkcolor['wifi'](q)

        }
      })

  map.on("viewreset", reset)

  reset()

  // Reposition the SVG to cover the features.
  function reset() {
    var bottomLeft = project(bounds[0]),
        topRight = project(bounds[1])

    var margin = 300

    svg .attr("width", topRight[0] - bottomLeft[0] + 2 * margin)
        .attr("height", bottomLeft[1] - topRight[1] + 2 * margin)
        .style("margin-left", (bottomLeft[0] - margin)+ "px")
        .style("margin-top", (topRight[1] - margin)+ "px")

    g   .attr("transform", "translate(" + (margin-bottomLeft[0]) + "," + (margin-topRight[1]) + ")")

    var nodes_svg = g.selectAll(".node")
    var links_svg = g.selectAll(".link")

    nodes_svg.attr("transform", function (d) { return "translate(" + project(d.geo).join(",") + ")"})

    links_svg.attr("x1", function (d) { return project(d.source.geo)[0] })
             .attr("y1", function (d) { return project(d.source.geo)[1] })
             .attr("x2", function (d) { return project(d.target.geo)[0] })
             .attr("y2", function (d) { return project(d.target.geo)[1] })

    position_labels(nodes_svg)
  }
}

function rect_intersect(a, b) {
  return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y)
}

function rect_uncenter(rect) {
  return {
    x: rect.x - rect.width/2,
    y: rect.y - rect.height/2,
    width: rect.width,
    height: rect.height
  }
}

function rect_add(rect, point) {
  return {
    x: rect.x + point[0],
    y: rect.y + point[1],
    width: rect.width,
    height: rect.height
  }
}

function rect_grow(rect, x) {
  return {
    x: rect.x - x/2,
    y: rect.y - x/2,
    width: rect.width + x,
    height: rect.height + x,
  }
}

function position_labels(nodes) {
  var labels = []
  var POINT_SIZE = 8

  var occupied = []

  nodes.each( function (d) {
    var xy = project(d.geo)
    var label = {
      angle: 0.0, // rotated around center
      offset: 0,
      nodes: [d],
      x: xy[0], y: xy[1],
      v: [0, 0]
    }
    labels.push(label)
  })

  nodes.each( function (d) {
    var p = project(d.geo)
    occupied.push({ x: p[0] - POINT_SIZE/2, y: p[1] - POINT_SIZE/2, width: POINT_SIZE, height: POINT_SIZE })
  })

  var zoom = map.getZoom() / map.getMaxZoom()

  /*
  labels.forEach( function (d) {
    var t = d.nodes.map( function (d) { return project(d.geo) })
    var s = t.reduce( function (p, n) { return [p[0] + n[0], p[1] + n[1]] })
    s = [s[0]/t.length, s[1]/t.length]
    d.x = s[0]
    d.y = s[1]
  })
  */

  labels.forEach( function (d) {
    labels.forEach( function (o, i) {
      if (d != o && d.x == o.x && d.y == o.y) {
        delete labels[i]
      }
    })
  })

  labels = labels.filter(function (d) { return d != undefined })

  g.select(".labels").selectAll(".label").remove()

  var labels_svg = g.select(".labels").selectAll(".label").data(labels)

  var label_nodes = labels_svg.enter().append("g")
                         .attr("class", "label")
                         .attr("transform", function (d) { return "translate(" + [d.x, d.y].join(",") + ")"})

  label_g = label_nodes.append("g").attr("class", "textbox").append("g")

  label_g.append("g").each( function (d) {
    var o = d3.select(this)

    d.nodes.forEach( function (n, i) {
      var name
      if (n.name)
        name = n.name
      else
        name = n.id

      o.append("text").text(name).attr("y", -i * 15)
    })
  })

  labelTextWidth = function (e) {
    return e.parentNode.querySelector("g").getBBox().width
  }

  labelTextHeight = function (e) {
    return e.parentNode.querySelector("g").getBBox().height
  }

  label_g.insert("rect", "g")
            .attr("y", function (d) { return -labelTextHeight(this) + 3})
            .attr("x", -1)
            .attr("width", function(d) { return labelTextWidth(this)})
            .attr("height", function (d) { return labelTextHeight(this)})

  label_g.each( function (d) {
    var o = d3.select(this)
    var r = o.select("rect")
    var x = -r.attr("width")/2 + 5
    var y = r.attr("height")/2 - 5
    o.attr("transform", "translate(" + [x,y].join(",") + ")")
  })

  label_nodes.each( function (d) {
    d.box = this.getBBox()
  })

  if (labels.length > 1) {
    labels.forEach( function (d, i) {
      d.angle = 0
      d.offset = 0
    })
  }

  label_nodes.each( function (d, i) {
    var box
    var intersects = false

    box = rect_add(rect_uncenter(label_box(d)), [d.x, d.y])

    occupied.forEach( function (d) {
      if (rect_intersect(d, box))
        intersects = true
    })

    if (intersects)
      this.remove()
    else
      occupied.push(box)
  })

  label_nodes.each(label_at_angle)
}

function label_box(label) {
  var offset = 4 + label.offset
  var x, y, a, b
  var angle = Math.PI*2 * label.angle

  a = offset + label.box.width/2
  b = offset + label.box.height/2

  x = a * Math.cos(angle)
  y = b * Math.sin(angle)

  return {width: label.box.width, height: label.box.height, x: x, y: y}
}

function label_at_angle(label) {
  var object = d3.select(this)
  var box = label_box(label)
  object.select(".textbox").attr("transform", "translate(" + box.x + "," + box.y + ")")
  object.select("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", box.x)
    .attr("y2", box.y)
}
function adjust_navigation() {
  var nav=document.getElementById("sitelink")
  nav.innerHTML=ffmapConfig.sitename;
  nav.href=ffmapConfig.url;
};
