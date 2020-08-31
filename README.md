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