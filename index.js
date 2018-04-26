"use strict";

const Sequelize = require('sequelize');
const winston = require('winston');

class SequelizeTransport extends winston.Transport {
  constructor(options) {
    super(options);

    this.options = options || {};
    this.name = options.name || 'sequelize';
    this.level = options.level || 'error';

    if (!this.options.tableName) {
      this.options.tableName = 'WinstonLog';
    }

    if (!this.options.sequelize) {
      throw new Error("Not found a sequelize instance");
    }

    const schema = Object.assign({
      level: Sequelize.STRING,
      message: Sequelize.STRING,
      meta: {
        type: Sequelize.TEXT,
        set: function (value) {
          this.setDataValue('meta', JSON.stringify(value));
        },
        get: function () {
          return JSON.parse(this.getDataValue('meta'));
        }
      }
    }, options.fields || {});

    const modelOptions = Object.assign({
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      indexes: [
        {
          name: 'level',
          fields: ['level']
        }
      ]
    }, options.modelOptions || {});

    this.model = this.options.sequelize.define(this.options.tableName, schema, modelOptions);
  }

  log(level, message, meta, callback) {
    const log = () => {
      let data = {
        message: message,
        level: level
      };

      if (typeof meta != 'object') {
        throw new Error("Meta information must be an object");
      }

      if (!meta) {
        meta = {};
      }

      data.meta = meta;

      this.model.create(data).then((log) => {
        this.emit('logged');
        callback(null, log.get());
      }).catch((err) => {
        this.emit('error', err);
        callback(err);
      });
    };

    return log();
  }

  clear(lifetime, callback) {
    if (typeof lifetime == 'function') {
      callback = lifetime;
      lifetime = undefined;
    }

    let clause = { truncate: true };

    if (typeof lifetime == 'number') {
      clause = { where: { updatedAt: { [Sequelize.Op.lt]: new Date(Date.now() - lifetime * 1000) } } };
    }

    return this.model.destroy(clause).then(() => {
      typeof callback == 'function' && callback();
    }).catch(function (err) {
      typeof callback == 'function' && callback(err);
      throw err;
    });
  };
}

winston.transports.Sequelize = SequelizeTransport;
module.exports = SequelizeTransport;
