# winston-transport-sequelize
Sequelize transport for module winston
# Install 
`npm install winston-transport-sequelize`
# Example
```js
var winston = require('winston');
var winstonTransportSequelize = require('winston-transport-sequelize');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(...);

var options = {
  sequelize: sequelize,
  tableName: 'WinstonLog' // this is defaultName
  ... other winston transport options
}

var log = new winston.Logger({
  transports: [
    new winstonTransportSequelize(options)
  ]
});
```

Sequelize model will be created after sequelize.sync()

You can find model in `transport.model`

# More
This transport has its own method `.clear([lifetime])`

You can clear table using this. Lifetime(ms) option for filtering by "updateAt" field. 
