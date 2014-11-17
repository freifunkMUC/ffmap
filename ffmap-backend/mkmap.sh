#!/bin/bash

THISDIR=$(dirname $0)
cd $THISDIR

export PATH=/usr/sbin:/usr/local/sbin:$PATH

PEERS=peers/
ALIASES=aliases_fastd.json
DEST=../

set -e

./mkaliases.py -p $PEERS -d $ALIASES
./bat2nodes.py -A -a $ALIASES -a aliases.json -o -d $DEST

