/**
 * Example Sequelize data model.  Please see http://docs.sequelizejs.com/
 */
'use strict';

const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  
  const artist = sequelize.define(
    'artist',
    {
      id: {
        type: DataTypes.INTEGER,        
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255)
      },
      image: {
        type: DataTypes.STRING(255)
      },
      popularity: {
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps      : false,
      freezeTableName : true,
      underscored     : true
    }
  );

  artist.associate = (models) => {
      artist.genre = artist.belongsToMany(
            models.genre,
            {
                as: models.genre.alias,
                through: {
                    model : models.artist_genre,
                    foreignKey: 'artist_id',
                    otherKey : 'genre_id'
                },
                constraints: false
            } 
        )
  }
  
  // Add any instance-specific functions through prototype
  artist.prototype.serialize = function() {
    return this.dataValues;
  };

  // These are the aliases other models with use
  artist.alias = 'artist';

  return artist;
    
};
