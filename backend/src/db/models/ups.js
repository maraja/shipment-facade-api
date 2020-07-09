'use strict';


module.exports = (sequelize, DataTypes) => {
    var UPS = sequelize.define('UPS', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID
        },
        shipmentId: {
            allowNull: false,
            type: DataTypes.UUID
        },
        upsId: {
            allowNull: false,
            type: DataTypes.STRING
        },
        price: {
            allowNull: false,
            type: DataTypes.FLOAT
        },
        provider_type: {
            allowNull: false,
            type: DataTypes.STRING
        },
        service_type: {
            allowNull: false,
            type: DataTypes.STRING
        },
        service_level: {
            allowNull: false,
            type: DataTypes.STRING
        },
        approx_delivery: {
            allowNull: false,
            type: DataTypes.STRING
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING
        },
    }, {tableName: "ups"});

    UPS.associate = function (models) {
        this.belongsTo(models.Shipment, {
            foreignKey: 'shipmentId',
            as: 'shipment',
            onDelete: 'cascade',
            hooks: true,
        });
    };

    return UPS;
};
