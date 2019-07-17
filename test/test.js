"use strict";

const assert = require('chai').assert;
const Sequelize = require('sequelize');
const winston = require('winston');
const WinstonTransportSequelize = require('../index');

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  operatorsAliases: +((Sequelize.version || '').split('.')[0]) >=5? undefined: false
});

const transport = new WinstonTransportSequelize({
  level: 'info',
  sequelize: sequelize,
  meta: { project: 'myProject' }
});

const logger = winston.createLogger({
  transports: [transport]
});

describe('WinstonTransportSequelize:', function () {
  let message = 'message';
  let meta = { meta: 'meta' };

  before(function() {
    return sequelize.sync({ force: true });
  });

  function transportCallback(loggedFn, errorFn) {
    function onLogged() {
      transport.removeListener('logged',  onLogged);
      loggedFn && loggedFn();
    }

    function onError() {
      transport.removeListener('error', onError);
      errorFn && errorFn();
    }

    transport.on('logged', onLogged).on('error', onError);
  }

  it('.log()', function (done) {
    function onLogged() {
      transport.model.findOne({ where: { message: 'message' } }).then((res) => {
        res = res.get();
        assert.equal(res.level, 'info', 'check level');
        assert.equal(res.meta.meta, 'meta', 'check meta.meta');
        assert.equal(res.meta.project, 'myProject', 'check meta.project');
        done();
      });
    }

    transportCallback(onLogged, () => { throw new Error('Error in the log function') });
    logger.info(message, { meta: meta });
  });

  it('.clean()', function () {
    return transport.clean(2000).then(() => {
      return transport.model.count().then((count) => {
        assert.equal(count, 1);
      });
    }).then(() => {
      return transport.clean().then(() => {
        return transport.model.count().then((count) => {
          assert.equal(count, 0);
        });
      });
    });
  });
});

