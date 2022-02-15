FROM adoptopenjdk/openjdk11:alpine-jre
#FROM adoptopenjdk/openjdk11:alpine-slim
LABEL MAINTAINER="thierry.milliard@softwareag.com" \
	DESCRIPTION="Buid simple SpringBoot java 11 image" \
	CUSTOM="true" \
	SAG="true" \
	TYPE="SpringBoot"
COPY demoAWS.jar demoAWS.jar
ENTRYPOINT ["java","-jar","./demoAWS.jar"]