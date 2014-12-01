ffmap
=====

Knoten- und Netzvisualisierung des  freifunk München Netzes basierend auf dem ffmap Framework von Nils Schneider

Installation:
* Clonen dieses Repos
* Ueberpruefen der Daten in der Config-Datei
* Ausfuehren von make um Einstellungen in der Config-Datei zu applizieren
* Sicherstellen, dass regelmaessig aktuelle nodes.json (aus ffmap-backend) und nodes_load.json (aus alfred 159) im Wurzelverzeichnis zur Verfuegung stehen
  bsp. Crontab:
  * * * * *   /opt/ffmap-backend/mkmap.sh
  */5 * * * * alfred-json -r 159 -f json -z > /var/www/ffmap/nodes_load.json 
