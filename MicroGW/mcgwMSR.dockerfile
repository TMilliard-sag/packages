FROM alpine:latest

MAINTAINER SoftwareAG

ENV MICROGW_DIR /opt/softwareag/Microgateway

RUN mkdir -p ${MICROGW_DIR}/logs

COPY adduser.sh ${MICROGW_DIR}
RUN ${MICROGW_DIR}/adduser.sh sagadmin 1724 ${MICROGW_DIR}

RUN chown -R 1724:1724 /opt/softwareag

COPY --chown=1724:1724 ./config/ ${MICROGW_DIR}/config/
COPY --chown=1724:1724 ./lib/ ${MICROGW_DIR}/lib/
COPY --chown=1724:1724 ./files/ ${MICROGW_DIR}/files/
COPY --chown=1724:1724 ./resources/ ${MICROGW_DIR}/resources/
COPY --chown=1724:1724 ./*.jar ${MICROGW_DIR}/
COPY --chown=1724:1724 ./*.sh ${MICROGW_DIR}/
COPY --chown=1724:1724 ./tmp-docker/pull-msr-service.yml ${MICROGW_DIR}/config/config.yml

COPY --chown=1724:1724 ./microgateway-jre-linux-musl/ ${MICROGW_DIR}/microgateway-jre-linux-musl/

EXPOSE 9090

HEALTHCHECK CMD ${MICROGW_DIR}/microgateway.sh status 2>&1 | grep 'Server active'

WORKDIR ${MICROGW_DIR}

USER 1724

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["-p", "9090", "-c", "config/config.yml", "-lv", "TRACE"]
