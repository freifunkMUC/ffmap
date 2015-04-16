function nodedetails(container, fn) {

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
          'Nodename': document.createTextNode(node.name),
          'Primäre MAC-Adresse': document.createTextNode(id),
          'Modell': (node.model)? document.createTextNode(node.model) : unknown.cloneNode(),
          'Firmware-Version': (node.firmware)? document.createTextNode(node.firmware) : unknown.cloneNode(),
          'Koordinaten': get_location_link(node)? (function() {
              var link = document.createElement('a');
              link.href = get_location_link(node);
              link.textContent = node.geo[0] + ',' + node.geo[1];
              return link;
          })() : unknown.cloneNode(),
          'Kontakt': (node.contact)? document.createTextNode(node.contact) : unknown.cloneNode()
      };
      for(var caption in details) {
          var li = document.createElement('li');
          li.appendChild(document.createTextNode(caption + ': '));
          li.appendChild(details[caption]);
          document.getElementById('nodedetails').appendChild(li);
      }

      var addr_split = node.addresses.split(",") 
      for(var i in addr_split) {
          var li = document.createElement('li');
          li.appendChild(document.createTextNode(addr_split[i]));
          document.getElementById('ip').appendChild(li);
      }
      nodecaption.textContent = node.hostname;


      var graphs_clients = document.createElement('div');
      graphs_clients.className = 'graph';
      graphs_clients.id = 'graphs_clients';
      document.getElementById('graphs').appendChild(graphs_clients);

      var clients_day = document.createElement('img');
      clients_day.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_clients_' + id.replace(/:/g, '') + '-day.png');
      clients_day.setAttribute('onerror', 'this.src="sorry.png"');      
      var clients_week = document.createElement('img');
      clients_week.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_clients_' + id.replace(/:/g, '') + '-week.png');
      clients_week.setAttribute('onerror', 'this.src="sorry.png"');      
      document.getElementById('graphs_clients').appendChild(clients_day);
      document.getElementById('graphs_clients').appendChild(clients_week);
      
      
      var graphs_trafficthroughput = document.createElement('div');
      graphs_trafficthroughput.className = 'graph';
      graphs_trafficthroughput.id = 'graphs_trafficthroughput';
      document.getElementById('graphs').appendChild(graphs_trafficthroughput);

      var trafficthroughput_day = document.createElement('img');
      trafficthroughput_day.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_trafficthroughput_' + id.replace(/:/g, '') + '-day.png');
      trafficthroughput_day.setAttribute('onerror', 'this.src="sorry.png"');      
      document.getElementById('graphs_trafficthroughput').appendChild(trafficthroughput_day);
      var trafficthroughput_week = document.createElement('img');
      trafficthroughput_week.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_trafficthroughput_' + id.replace(/:/g, '') + '-week.png');
      trafficthroughput_week.setAttribute('onerror', 'this.src="sorry.png"');      
      document.getElementById('graphs_trafficthroughput').appendChild(trafficthroughput_week);
     
      var graphs_traffic = document.createElement('div');
      graphs_traffic.className = 'graph';
      graphs_traffic.id = 'graphs_traffic';
      document.getElementById('graphs').appendChild(graphs_traffic);

      var traffic_day = document.createElement('img');
      traffic_day.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_traffic_' + id.replace(/:/g, '') + '-day.png');
      traffic_day.setAttribute('onerror', 'this.src="sorry.png"');      
      document.getElementById('graphs_trafficthroughput').appendChild(trafficthroughput_week);
      document.getElementById('graphs_traffic').appendChild(traffic_day);
      var traffic_week = document.createElement('img');
      traffic_week.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_traffic_' + id.replace(/:/g, '') + '-week.png');
      traffic_week.setAttribute('onerror', 'this.src="sorry.png"');      
      document.getElementById('graphs_traffic').appendChild(traffic_week);


      var graphs_uptime = document.createElement('div');
      graphs_uptime.className = 'graph';
      graphs_uptime.id = 'graphs_uptime';
      document.getElementById('graphs').appendChild(graphs_uptime);

      var uptime_day = document.createElement('img');
      uptime_day.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_uptime_' + id.replace(/:/g, '') + '-day.png');
      document.getElementById('graphs_uptime').appendChild(uptime_day);
      var uptime_week = document.createElement('img');
      uptime_week.setAttribute('src', ffmapConfig.munin_path + 'ffmuc_uptime_' + id.replace(/:/g, '') + '-week.png');
      document.getElementById('graphs_uptime').appendChild(uptime_week);
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
