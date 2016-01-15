FROM miseyu/docker-phantomjs2
#RUN wget -qO- https://deb.nodesource.com/setup_4.x | sudo bash - && apt-get update && apt-get install --yes nodejs
RUN git config --global url."https://github.com/".insteadOf "git://github.com/"
RUN npm install -g bower
