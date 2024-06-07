const Sequelize = require('sequelize');

const sequelize = new Sequelize("podocontrol", "root", "", {
    dialect : "mysql",
    host: "127.0.0.1",
    logging: false
});

module.exports = function (sequelize) {
    return sequelize.define("dataModel", {
        name : {
            type: Sequelize.STRING(30)
        },
        num : {
            type: Sequelize.STRING(30)
        },
        procedura : {
            type: Sequelize.STRING(50)
        },
        date : {
            type: Sequelize.STRING(10)
        },
        time : {
            type: Sequelize.STRING(5)
        },
    }, {
        timestamps: false,
        tableName: 'podocontrol'
    });        
}

const dataModel = require('./dataModel')(sequelize);

module.exports = {
    sequelize: sequelize,
    podocontrol : dataModel
}