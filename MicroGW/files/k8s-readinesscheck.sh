#!/bin/sh
#
# Check that the server is still responding
#
cd $(dirname $0)/..
outfile="logs/k8s-readiness-status.out"
./microgateway.sh status &> $outfile
if [ $? -ge 2 ]
then
   echo "k8s-readinesscheck: Server is no longer responding"
   exit 1
fi
