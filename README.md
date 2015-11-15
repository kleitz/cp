![consumerproject](http://i.imgur.com/iLlaWxJ.png)

A crowd sourced platform to help us all learn a little bit more about the
things we buy, sell, and consume every day.

### usage

`make install service` will install depedencies and start search services.

### configuration

for monitoring setup see
[web-client](https://github.com/consumr-project/web-client/blob/master/docs/monitoring.md)'s
documentation

### deploying to heroku

this is a background process, so no need to make heroku bing to web ports:

```bash
heroku ps:scale web=0
heroku ps:scale worker=1
```

email transport configuration

```bash
heroku config:set EMAIL_SERVICE_NAME=$(echo $CP_EMAIL_SERVICE_NAME)
heroku config:set EMAIL_SERVICE_USER=$(echo $CP_EMAIL_SERVICE_USER)
heroku config:set EMAIL_SERVICE_PASS=$(read -p "email transport password: " password; echo $password)
```

to build and run application in debug mode:

```bash
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set DEBUG=*
```

### thanks

development (free) emails sent by [gmail](http://gmail.com/)
