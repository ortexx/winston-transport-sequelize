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

Sequelize model is created after __sequelize.sync()__

You can find the model in `transport.model`

# More
This transport has own method `.clean([lifetime], [callback])`

You can clean the old data via __this.clean(ms)__, filtering by "updateAt" field.
