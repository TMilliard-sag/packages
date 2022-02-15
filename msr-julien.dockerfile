#
# Template to customise MSR based image
#
# This template for AWS demo to buyild Julien's MSR 
# 2022-01-14

FROM store/softwareag/webmethods-microservicesruntime:10.11.0.0-slim
LABEL MAINTAINER="thierry.milliard@softwareag.com" \
	DESCRIPTION="Used for containerized demo" \
	COMMENT="MSR" \
	CUSTOM="true" \
	SAG="true" \
	BUILD=2022-01-05-build-msc \
	BUILD-TEMPLATE="demo" \
	TYPE="Micro Service"
#user root

# define exposed ports

EXPOSE 5555
EXPOSE 9999

# user to be used when running scripts
USER sagadmin

# files to be added to based image (includes configuration and package)

	ADD --chown=sagadmin ./resources/msr.xml /opt/softwareag/IntegrationServer/config/licenseKey.xml
	ADD --chown=sagadmin ./resources/application.properties /opt/softwareag/IntegrationServer/application.properties
	ADD --chown=sagadmin ./resources/mysql-connector-java-5.1.47.jar /opt/softwareag/IntegrationServer/lib/jars
	ADD --chown=sagadmin ./resources/ISCoreAudit.xml /opt/softwareag/IntegrationServer/config/jdbc/function/ISCoreAudit.xml
	ADD --chown=sagadmin ./resources/CentralUsers.xml /opt/softwareag/IntegrationServer/config/jdbc/function/CentralUsers.xml
	ADD --chown=sagadmin ./resources/audit.xml /opt/softwareag/IntegrationServer/config/jdbc/pool/audit.xml
	ADD --chown=sagadmin ./support/lib /opt/softwareag/common/lib

# PACKAGE TO DEPLOY

	ADD --chown=sagadmin ./source/packages /opt/softwareag/IntegrationServer/packages
#	ADD --chown=sagadmin ./source/packages/MSR_addition /opt/softwareag/IntegrationServer/packages/MSR_addition
#	ADD --chown=sagadmin ./source/packages/msr_demo /opt/softwareag/IntegrationServer/packages/msr_demo
#	ADD --chown=sagadmin ./source/packages/WmCloudStreams /opt/softwareag/IntegrationServer/packages/WmCloudStreams
#	ADD --chown=sagadmin ./source/packages/WmCloudStreamsAnalytics /opt/softwareag/IntegrationServer/packages/WmCloudStreamsAnalytics
#	ADD --chown=sagadmin ./source/packages/WmCloudStreamsDeployer /opt/softwareag/IntegrationServer/packages/WmCloudStreamsDeployer
#	ADD --chown=sagadmin ./source/packages/WmSalesforceProvider /opt/softwareag/IntegrationServer/packages/WmSalesforceProvider


# Scripts to be executed during build (must be included in add files files above and include path!!)

RUN mkdir /opt/softwareag/IntegrationServer/cache
