FROM miseyu/docker-phantomjs2
RUN wget -O - http://nodejs.org/dist/v4.2.4/node-v4.2.4.tar.gz | tar xvzf - && \
    cd node-v4.2.4 && ./configure --prefix=/usr && make && make install
RUN npm install -g bower
