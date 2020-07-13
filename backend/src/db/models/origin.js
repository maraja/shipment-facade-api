'use strict';


module.exports = (sequelize, DataTypes) => {
    var Origin = sequelize.define('Origin', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID
        },
        shipmentId: {
            allowNull: false,
            type: DataTypes.UUID
        },
        first_name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        last_name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        street_line_one: {
            allowNull: false,
            type: DataTypes.STRING
        },
        city: {
            allowNull: false,
            type: DataTypes.STRING
        },
        state: {
            allowNull: false,
            type: DataTypes.STRING
        },
        zip: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {tableName: "origin"});

    Origin.associate = function (models) {
        this.belongsTo(models.Shipment, {
            foreignKey: 'shipmentId',
            as: 'shipment',
            onDelete: 'cascade',
            hooks: true,
        });
    };

    return Origin;
};
