module.exports.up = (queryInterface, DataTypes) => {
    return queryInterface.createTable("fedex", {
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

module.exports.down = queryInterface => queryInterface.dropTable("fedex");

