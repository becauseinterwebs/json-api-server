/**
 * Example Sequelize data model.  Please see http://docs.sequelizejs.com/
 */
'use strict';

const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  
  const genre = sequelize.define(
    'genre',
    {
      id: {
        type: DataTypes.INTEGER,        
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255)
      }
    },
    {
      timestamps      : false,
      freezeTableName : true,
      underscored     : true
    }
  );

  // Add any instance-specific functions through prototype
  genre.prototype.serialize = function() {
    return this.dataValues;
  };

  genre.associate = (models) => {
      genre.genre = genre.belongsToMany(
            models.artist,
            {
                as : models.artist.alias,
                through: {
                    model : models.artist_genre,
                    foreignKey: 'genre_id',
                    otherKey : 'artist_id'
                },
                constraints: false
            } 
        )
  }
  // These are the aliases other models with use
  genre.alias = 'genre';

  return genre;
    
};
