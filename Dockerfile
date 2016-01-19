FROM miseyu/docker-phantomjs2

RUN git config --global url."https://github.com/".insteadOf "git://github.com/" && \
    echo '{ "allow_root": true }' > /root/.bowerrc && \
    npm install -g bower

WORKDIR /myapp
ADD . /myapp

RUN npm install && \
    bower install

CMD grunt test:unit
