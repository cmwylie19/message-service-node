

[![codecov](https://codecov.io/gh/cmwylie19/message-service-node/branch/master/graph/badge.svg)](https://codecov.io/gh/cmwylie19/message-service-node)   
# message-service-node


## Setup Babel sop you can use es6 imports
```
npm install --save-dev jest babel-jest @babel/preset-env 
```

Create the file named `babel.config.js`
```
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
```

# Message Service 


## Local Development

### MongoDB
Pull mongo image in docker.
```
docker pull mongo
```

Check the status of your mongodb server.
```
docker ps
```

Check the lgos of the monogdb server
```
docker logs mongodb 
```

start mongo 
```
docker run -it --name mongodb -p 27017:27017 -d mongo
```


Connect to the container using interactive terminal
```
docker exec -it mongodb bash
```

Login
```
mongo -host localhost -port 27017  
```

### Redis
Pull Redis container image
```
docker pull redis
```


Start the redis container 
```
 docker run --name redis-cache -p 6379:6379 -d redis
```


Connect to the container using interactive terminal
```
docker exec -it redis-cache bash
```
