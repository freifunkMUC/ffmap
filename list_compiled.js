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
function nodetable(table, fn) {
  var thead, tbody, tfoot

  function prepare() {
    thead = table.append("thead")
    tbody = table.append("tbody")
    tfoot = table.append("tfoot")

    var tr = thead.append("tr")

    tr.append("th").text("Name")
    tr.append("th").text("Status")
    tr.append("th").text("Clients")
    tr.append("th").text("WLAN Links")
    tr.append("th").text("VPN")
    tr.append("th").text("Geo")
    tr.append("th").text("Firmware")
    tr.append("th").text("Modell")
    tr.append("th").text("Uptime [Std.]")
  }

  function sum(arr, attr) {
    return arr.reduce(function(old, node) { return old + node[attr] }, 0)
  }

  function update(data) {
    var non_clients = data.nodes.filter(function (d) { return !d.flags.client })
    var doc = tbody.selectAll("tr").data(non_clients)
    
    var row = doc.enter().append("tr")

    row.classed("online", function (d) { return d.flags.online })
    
    row.append("td").text(function (d) { return d.name?d.name:d.id })
    row.append("td").text(function (d) { return d.flags.online?"online":"offline" })
    row.append("td").text(function (d) { return d.clients.length })
    row.append("td").text(function (d) { return d.wifilinks.length })
    row.append("td").text(function (d) { return d.vpns.length })
    row.append("td").text(function (d) { return d.geo?"ja":"nein" })
    row.append("td").text(function (d) { return d.firmware })
    row.append("td").text(function (d) { return d.model })
    row.append("td").text(function (d) { tmp = (d.uptime / 3600).toFixed(2); return tmp>0?tmp:''; })

    var foot = tfoot.append("tr")
    foot.append("td").text("Summe")
    foot.append("td").text(non_clients.reduce(function(old, node) { return old + node.flags.online }, 0) + " / " + non_clients.length)
    foot.append("td").text(non_clients.reduce(function(old, node) { return old + node.clients.length }, 0))
    foot.append("td").attr("colspan", 2).text("")
    foot.append("td").text(non_clients.reduce(function(old, node) { return old + (node.geo?1:0)}, 0))
    foot.append("td").text(non_clients.reduce(function(old, node) { return old + (node.firmware?1:0) }, 0) + " mit Gluon")
    foot.append("td").attr("colspan", 2 ).style("text-align", "right").text("Aktualisiert: " + (new Date(data.meta.timestamp + 'Z')).toLocaleString())

    $("#list").tablesorter({sortList: [[0,0]]})
  }

  var data

  function fetch(fn) {
    load_nodes(fn, data, update)
  }


  prepare()

  fetch(fn)
}

function init() {
  table = nodetable(d3.select("#list"), ffmapConfig.nodes_json)
  adjust_navigation()
}
function adjust_navigation() {
  var nav=document.getElementById("sitelink")
  nav.innerHTML=ffmapConfig.sitename;
  nav.href=ffmapConfig.url;
};
