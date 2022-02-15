#!/bin/sh

IS_ALPINE=1

if [ -f /etc/os-release ]
then
    cat /etc/os-release | grep -i alpine > /dev/null
    IS_ALPINE=$?
fi

export MICROGATEWAY_DIR=.

if [ -d ${MICROGATEWAY_DIR}/microgateway-jre-linux-musl ] && [ ${IS_ALPINE} -eq 0 ]
then
    JAVA_EXE=${MICROGATEWAY_DIR}/microgateway-jre-linux-musl/bin/java
else
    if [ -d ${MICROGATEWAY_DIR}/microgateway-jre-linux ]
    then
        JAVA_EXE=${MICROGATEWAY_DIR}/microgateway-jre-linux/bin/java
    else
        if [ -f ${JAVA_HOME}/bin/java ]
        then
            JAVA_EXE=${JAVA_HOME}/bin/java
        else
            JAVA_EXE=java
        fi            
    fi
fi

#echo "JAVA_EXE=${JAVA_EXE}"
${JAVA_EXE} -jar "${MICROGATEWAY_DIR}/microgateway-cli.jar" "$@"
