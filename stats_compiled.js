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
var meshinfo = d3.select("#stats")

meshinfo.append("p") .attr("id", "nodecount")

meshinfo.append("p") .attr("id", "gatewaycount")

meshinfo.append("p") .attr("id", "clientcount")

var data

function reload() {
  load_nodes(ffmapConfig.nodes_json, data, handler)

  function handler(json) {
    data = json

    var nNodes = data.nodes.filter(function(d) {
                   return !d.flags.client && d.flags.online
                 }).length,
        nGateways = data.nodes.filter(function(d) {
                   return d.flags.gateway && d.flags.online
                 }).length,
        nClients = data.nodes.filter(function(d) {
                   return d.flags.client && d.flags.online
                 }).length

    d3.select("#nodecount")
      .text(nNodes + " Knoten")

    d3.select("#gatewaycount")
      .text(nGateways + " Gateways")

    d3.select("#clientcount")
      .text("ungefähr " + (nClients - nNodes) + " Clients")
  }
}

reload()
var timer = window.setInterval(reload, 30000)

function adjust_navigation() {
  var nav=document.getElementById("sitelink")
  nav.innerHTML=ffmapConfig.sitename;
  nav.href=ffmapConfig.url;
};
