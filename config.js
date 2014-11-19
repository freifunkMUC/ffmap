/* after making any changes here enter "make" in your terminal to appy the changes */

var ffmapConfig = {
  // link to your main community site:
  url:       "http://freifunk-muenchen.de",
  
  // visible link in the navigation:
  sitename:  "www.freifunk-muenchen.de",
  
  // initial gravity, friction, of the graph at pageload:
  gravity:   0.03,
  friction:  0.73,
  theta:     0.8,
  charge:    1.0,
  distance:  0.6,
  strength:  1.0,

  // path to the nodes.json
  nodes_json: "nodes.json",
  munin_path: "http://89.22.97.5/munin/vs3666/munin.vs3666/",
};
