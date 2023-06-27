# Base image
FROM ubuntu:20.04
LABEL authors="Ricardo Reichert"
LABEL Description="CodeShip Deploy Biblioteca"
LABEL Version="1.0"

# Define o diretório de trabalho do app
WORKDIR /app

# Instala o pacote SSH
RUN apt-get update && apt-get install -y ssh

# Instala o pacote Openssh Client
RUN apt-get install -y openssh-client