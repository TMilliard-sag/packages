#!/bin/sh
#
# Check that the server is still up
#
cd $(dirname $0)/..
outfile="logs/k8s-lifeness-status.out"
./microgateway.sh status &> $outfile
if [ $? -eq 2 ]
then
   echo "k8s-lifenesscheck: Server is no longer active"
   exit 1
fi
