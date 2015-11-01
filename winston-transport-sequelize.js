var Sequelize = require('sequelize');
var winston = require('winston');
var util = require('util');

var SequelizeTransport = module.exports = function (options) {
    this.options = options || {};
    
    this.name = 'sequelize';
    this.level = options.level || 'error';
    
    if (!this.options.tableName) {
        this.options.tableName = 'WinstonLog';
    }
    
    if (!this.options.sequelize) {
        throw new Error("Not found sequelize");
    }
    
    this.model = this.options.sequelize.define(this.options.tableName,{
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
    }, {		
		timestamps: true,
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',	
        indexes: [
            {
                name: 'level',
                fields: ['level']
            }
        ]
    });
};

util.inherits(SequelizeTransport, winston.Transport);

SequelizeTransport.prototype.log = function (level, message, meta, callback) {
    var self = this;

    if (this.options.before) {
        this.options.before(function () {
            log();
        });
    }
    else {
        return log();
    }
    
    function log() {
        var data = {
            message: message,
            level: level
        }
        if (typeof meta != 'object') {
            throw new Error("Meta informtion must be object");
        }
        
        if (!meta) {
            meta = {};
        }
        
        data.meta = meta;

        self.model.create(data).then(function (log) {
            self.emit('logged');
            callback(null, log.get());
        })
        .catch(function (err) {
            self.emit('error', err);
            callback(err);
        });
    }    
};

SequelizeTransport.prototype.clear = function (lifetime) {
    var clause = { truncate: true };
    
    if (typeof lifetime == 'number') {
        clause = { where: { updatedAt: { $lt: new Date(Date.now() - lifetime) } } };
    }
    
    return this.model.destroy(clause);
};

winston.transports.Sequelize = SequelizeTransport;