import { CONFIG, merge } from '../utils';
// XXX import { CONFIG, TRACKING, merge } from '../utils';
import { DataTypes } from 'sequelize';

const Type: DataTypes = require('sequelize/lib/data-types');

export = sequelize => {
    var User = require('./user')(sequelize),
        Tag = require('./tag')(sequelize);

    var TagFollower = sequelize.define('tag_follower', merge({
        tag_id: {
            type: Type.UUID,
            allowNull: false
        },

        user_id: {
            type: Type.UUID,
            allowNull: false
        }
    }), CONFIG);

    Tag.belongsToMany(User, { through: TagFollower });
    User.belongsToMany(Tag, { through: TagFollower });

    return TagFollower;
};
