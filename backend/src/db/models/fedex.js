'use strict';


module.exports = (sequelize, DataTypes) => {
    var FedEx = sequelize.define('FedEx', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID
        },
        shipmentId: {
            allowNull: false,
            type: DataTypes.UUID
        },
        fedexId: {
            allowNull: false,
            type: DataTypes.STRING
        },
        price: {
            allowNull: false,
            type: DataTypes.FLOAT
        },
        service_type: {
            allowNull: false,
            type: DataTypes.STRING
        },
        service_level: {
            allowNull: false,
            type: DataTypes.STRING
        },
        delivery: {
            allowNull: false,
            type: DataTypes.STRING
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING
        },
    }, {tableName: "fedex"});

    FedEx.associate = function (models) {
        this.belongsTo(models.Shipment, {
            foreignKey: 'shipmentId',
            as: 'shipment',
            onDelete: 'cascade',
            hooks: true,
        });
    };

    return FedEx;
};
