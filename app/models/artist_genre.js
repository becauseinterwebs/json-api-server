/**
 * Example Sequelize data model.  Please see http://docs.sequelizejs.com/
 */
'use strict';

const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  
  const artist_genre = sequelize.define(
    'artist_genre',
    {
      id: {
        type: DataTypes.INTEGER,        
        primaryKey: true
      },
      artist_id: {
        type: DataTypes.INTEGER
      },
      genre_id: {
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps      : false,
      freezeTableName : true,
      underscored     : true
    }
  );

  // Add any instance-specific functions through prototype
  artist_genre.prototype.serialize = function() {
    return this.dataValues;
  };

  // These are the aliases other models with use
  artist_genre.alias = 'artist_genre';

  return artist_genre;
    
};
