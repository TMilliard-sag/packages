#!/bin/sh
# Usage: ./adduser.sh username id home
# e.g. ./adduser.sh sagadmin 1724 /opt/softwareag/Microgateway

if [ $# -ne 3 ]
then
    echo "Usage: adduser.sh username id home"
    exit 1
fi

user=$1
id=$2
home=$3

text=`cat /etc/passwd | grep "^${user}:"`
if [ -n "${text}" ]
then
    echo "${user} already exists!"
    exit 0
fi

text=`cat --help 2>&1 | grep BusyBox`
if [ -n "${text}" ]
then
    adduser -u ${id} -g ${id} -D -h ${home} ${user}
else
    groupadd -g ${id} ${user}
    useradd -u ${id} -m -g ${id} -d ${home} ${user}
fi

