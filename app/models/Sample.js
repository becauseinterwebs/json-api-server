/**
 * Example Sequelize data model.  Please see http://docs.sequelizejs.com/
 */
'use strict';

const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  
  const Sample = sequelize.define(
    'Sample',
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
      timestamps      : true,
      freezeTableName : true,
      underscored     : false
    }
  );

  // These are the aliases other models with use
  Sample.alias = 'Sample';

  return Sample;
    
};
