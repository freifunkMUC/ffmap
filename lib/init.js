function adjust_navigation() {
  var nav=document.getElementById("sitelink")
  nav.innerHTML=ffmapConfig.sitename;
  nav.href=ffmapConfig.url;
};
function get_location_link(d) {
  try {
    return 'geomap.html?lat=' + d.geo[0] + '&lon=' + d.geo[1];
  } catch(exc) {
    return null;
  }
};
