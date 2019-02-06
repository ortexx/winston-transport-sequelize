"use strict";

const Sequelize = require('sequelize');
const winston = require('winston');
const Transport = require('winston-transport');

class SequelizeTransport extends Transport {
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
      message: Sequelize.TEXT,
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

  log(info, callback) {
    const log = () => {
      const data = {
        message: info.message,
        level: info.level
      };

      const meta = info.meta;
      
      if (meta && typeof meta != 'object') {
        throw new Error("Meta information must be an object");
      }

      data.meta = Object.assign({}, this.options.meta || {}, meta || {});

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
