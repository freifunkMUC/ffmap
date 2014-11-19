function nodedetails(container, fn) {
  function bindLegendClick(plot) {
      $('.legendColorBox', plot.getPlaceholder()).click(function(e) {
          var ds = this.nextSibling.textContent;
          var rrd = plot.getPlaceholder().parent().closest('div').get(0).rrd;
          var data = rrd.rrd_flot_obj.graph.getData();
          for(var i = 0; i < data.length; i++) {
              if(data[i].label == ds) {
                  if(data[i].data_bak) {
                      data[i].data = data[i].data_bak;
                      data[i].data_bak = null;
                      data[i].color = data[i].color_bak;
                  } else {
                      data[i].data_bak = data[i].data;
                      data[i].data = [];
                      data[i].color_bak = data[i].color;
                      data[i].color = "#fff";
                  }
              }
          }
          rrd.rrd_flot_obj.graph.setData(data);
          rrd.rrd_flot_obj.graph.setupGrid();
          rrd.rrd_flot_obj.graph.draw();
      });
  }
  function addAxisLabel(plot) {
      var rrd = plot.getPlaceholder().parent().closest('div').get(0).rrd;
      var yaxisLabel = $('<div class="axisLabel yaxisLabel">')
          .text(rrd.unit)
          .appendTo(plot.getPlaceholder());
      yaxisLabel.css("margin-top", yaxisLabel.width() / 2 - 20)
  }
  function addResetButton(plot) {
      var rrd = plot.getPlaceholder().parent().closest('div').get(0).rrd;
      var button = $('<button>')
          .addClass('reset')
          .text('Reset')
          .on('click', function() {rrd.rrd_flot_obj.callback_scale_reset();})
          .appendTo(plot.getPlaceholder());
  }
  function suffixFormatter(val, axis) {
      if (val > 1000000)
          return (val / 1000000).toFixed(axis.tickDecimals) + " M";
      else if (val > 1000)
          return (val / 1000).toFixed(axis.tickDecimals) + " k";
      else
          return val.toFixed(axis.tickDecimals);
  }
  function timeFormatter(val, axis) {
      var ret = "";
      if(val > 60*60) {
          ret += (val / (60*60)).toFixed(0) + "h";
          val %= 60*60;
      }
      if(val != 0) {
          ret += ((val % (60*60)) / 60).toFixed(0) + "m";
          val %= 60;
      }
      if(val > 0)
          ret += (val % 60).toFixed(0) + "s";
      return ret;
  }
  function timeTickGenerator(axis) {
      if(axis.delta > 60*60)
          axis.tickSize = Math.round(axis.tickSize / (60*60))*(60*60);
      if(axis.delta > 60)
          axis.tickSize = Math.round(axis.tickSize / 60)*60;
      return axis.tickGenerator(axis);
  }
  var graphs = [
      {name: "clients", unit: "# of clients", DS: ['clients']},
      {name: "neighbors", unit: "# of neighbors", DS: ['neighbors', 'vpn_neighbors']},
      {name: "traffic_bytes", unit: "Bytes/s", formatter: suffixFormatter, DS: ['rx_bytes', 'tx_bytes', 'mgmt_rx_bytes', 'mgmt_tx_bytes', 'forward_bytes']},
      {name: "traffic_packets", unit: "Packets/s", formatter: suffixFormatter, DS: ['rx_packets', 'tx_packets', 'mgmt_rx_packets', 'mgmt_tx_packets', 'forward_packets']},
      {name: "loadavg", unit: "processes waiting for execution", DS: ['loadavg']},
  ];
  function update(data) {
      var id = document.location.search.match(/[&\?]id=([^&]+)($|&)/)[1];
      var filename = './ffmap-backend/nodedb/' + id.replace(/:/g, '') + '.rrd';
      var node;
      for(var i = 0; i < data.nodes.length; i++) {
          if(data.nodes[i].id == id)
              node = data.nodes[i];
      }
      var nodecaption = document.getElementById('nodecaption');
      if(!node) {
          nodecaption.textContent = id;
          document.getElementById('graphs').textContent = 'Knoten nicht gefunden!';
          return false;
      }
      var unknown = document.createTextNode('unbekannt');
      var details = {
          'Primäre MAC-Adresse': document.createTextNode(id),
          'Modell': (node.model)? document.createTextNode(node.model) : unknown.cloneNode(),
          'Firmware-Version': (node.firmware)? document.createTextNode(node.firmware) : unknown.cloneNode(),
          'Koordinaten': get_location_link(node)? (function() {
              var link = document.createElement('a');
              link.href = get_location_link(node);
              link.textContent = node.geo[0] + ',' + node.geo[1];
              return link;
          })() : unknown.cloneNode()
      };
      for(var caption in details) {
          var li = document.createElement('li');
          li.appendChild(document.createTextNode(caption + ': '));
          li.appendChild(details[caption]);
          document.getElementById('nodedetails').appendChild(li);
      }
      nodecaption.textContent = node.hostname;
      for(var i = 0; i < graphs.length; i++) {
          var div = document.createElement('div');
          div.className = 'graph';
          div.id = graphs[i].name;
          document.getElementById('graphs').appendChild(div);
          var rrd = new rrdFlotAsync(
              graphs[i].name,
              filename,
              null,
              {
                  grid: {
                      margin: {left: graphs[i].unit?22:0},
                      borderWidth: 1,
                  },
                  yaxis: {
                      min: 0,
                      tickDecimals: graphs[i].unit.substring(0,1) == '#'? 0 : null,
                      tickFormatter: graphs[i].formatter,
                      ticks: graphs[i].name == "uptime"? timeTickGenerator : null,
                      autoscaleMargin: 0.01,
                  },
                  hooks: {
                      draw: [bindLegendClick],
                      bindEvents: [graphs[i].unit?addAxisLabel:function(){}, addResetButton]
                  },
                  selection: {
                      minWidth: 5
                  },
                  tooltip: true,
                  tooltipOpts: { content: "<h4>%s</h4> Value: %y" },
              },
              null,
              {graph_only: true, use_checked_DSs: true, checked_DSs: graphs[i].DS, use_rra: true, rra: 1}
          );
          rrd.unit = graphs[i].unit;
          document.getElementById(graphs[i].name).rrd = rrd;
      }
  }

  var data

  function fetch(fn) {
    load_nodes(fn, data, update)
  }

  fetch(fn)
}

function init() {
  nodedetails(d3.select('#graphs'), ffmapConfig.nodes_json)
  adjust_navigation()
}
