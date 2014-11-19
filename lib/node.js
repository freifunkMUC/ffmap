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


      var clients_day = document.createElement('img');
      clients_day.setAttribute('src', ffmapConfig.munin_path + 'ffmuc-clients-' + id.replace(/:/g, '') + '-day.png');
      document.getElementById('graphs').appendChild(clients_day);
/*
      for(var i = 0; i < graphs.length; i++) {
          var div = document.createElement('div');
          div.className = 'graph';
          div.id = graphs[i].name;
          document.getElementById('graphs').appendChild(div);
          
          document.getElementById(graphs[i].name).rrd = rrd;
      } */
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
