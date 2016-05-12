import { CONFIG, TRACKING, merge } from '../utils';
import { DataTypes } from 'sequelize';

const Type: DataTypes = require('sequelize/lib/data-types');

export = sequelize => {
    var User = require('./user')(sequelize);

    var Feedback = sequelize.define('feedback', merge(TRACKING(), {
        id: {
            type: Type.UUID,
            allowNull: false,
            primaryKey: true
        },

        user_id: {
            type: Type.UUID,
            allowNull: false
        },

        type: {
            type: Type.ENUM('question', 'suggestion' ,'problem'),
            allowNull: false
        },

        referrer: {
            type: Type.STRING,
            validate: {
                len: [1, 100]
            },
        },

        message: {
            type: Type.TEXT,
            validate: {
                len: [1, 1000]
            },
        },
    }), merge(CONFIG, {
        tableName: 'feedback'
    }));

    Feedback.belongsTo(User);

    return Feedback;
};