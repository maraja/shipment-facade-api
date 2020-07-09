module.exports.up = (queryInterface, DataTypes) => {
    return queryInterface.createTable("shipment", {
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
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        deletedAt: {
            allowNull: true,
            type: DataTypes.DATE
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {charset: "utf8"})
}

module.exports.down = queryInterface => queryInterface.dropTable("shipment");

