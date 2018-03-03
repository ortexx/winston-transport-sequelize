# winston-transport-sequelize
Sequelize transport for winston

# Install 
`npm install winston-transport-sequelize`

# Example

```js
const winston = require('winston');
const WinstonTransportSequelize = require('winston-transport-sequelize');
const Sequelize = require('sequelize');

const sequelize = new Sequelize();

const options = {
  sequelize: sequelize, // required
  tableName: 'WinstonLog', // this is default name
  fields: { meta: Sequelize.JSONB }, // you can merge model fields
  modelOptions: { timestamps: false }, // you can merge model options
  //... other winston transport options
}

const logger = new winston.Logger({
  transports: [
    new WinstonTransportSequelize(options)
  ]
});
```

Sequelize model will be created after sequelize.sync()

You can find model in `transport.model`

# More
This transport has its own method `.clear([lifetime], [callback])`

You can clear table using this. Lifetime(seconds) option for filtering by "updateAt" field. 
