#!/bin/bash

cd $(dirname $0)

export PATH=/usr/sbin:/usr/local/sbin:$PATH

PEERS=/etc/fastd/ffm-mesh-vpn/peers/
ALIASES="$(dirname "$0")"/aliases_fastd.json
DEST="$(dirname "$0")"/../

set -e

"$(dirname "$0")"/mkaliases.py -p $PEERS -d $ALIASES
"$(dirname "$0")"/bat2nodes.py -A -a $ALIASES -a "$(dirname "$0")"/aliases.json -o -d $DEST
#./bat2nodes.py -A -m bat0 -d $DEST
#"$(dirname "$0")"/bat2nodes.py -A -d $DEST


