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
  sequelize: sequelize, // sequelize instance [required]
  tableName: 'WinstonLog', // default name
  meta: { project: 'myProject' }, // meta object defaults
  fields: { meta: Sequelize.JSONB }, // merge model fields
  modelOptions: { timestamps: false }, // merge model options
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

You can clear table using this.clear(seconds) option for filtering by "updateAt" field. 
