'use strict';


module.exports = (sequelize, DataTypes) => {
    var Shipment = sequelize.define('Shipment', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID
        },
        height: {
            allowNull: false,
            type: DataTypes.FLOAT
        },
        length: {
            allowNull: false,
            type: DataTypes.FLOAT
        },
        width: {
            allowNull: false,
            type: DataTypes.FLOAT
        },
        weight: {
            allowNull: false,
            type: DataTypes.FLOAT
        }
    }, {tableName: "shipment"});

    Shipment.associate = function (models) {
        this.hasOne(models.FedEx, {foreignKey: 'shipmentId', as: "fedexShipment", onDelete: 'cascade', hooks: true});
        this.hasOne(models.UPS, {foreignKey: 'shipmentId', as: "upsShipment", onDelete: 'cascade', hooks: true});
    };

    return Shipment;
};
