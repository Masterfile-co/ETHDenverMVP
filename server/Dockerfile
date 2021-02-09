FROM ubuntu:latest

WORKDIR /usr/src

RUN apt-get update -y && \
    apt-get install -y libffi-dev python3-dev python3-pip python3-venv build-essential libssl-dev git

COPY . .

RUN pip3 install -r requirements.txt

RUN chmod +x start.sh

CMD ["./start.sh"]