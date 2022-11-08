
const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection');

class ProductTag extends Model {}

ProductTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false, 
      primaryKey: true,
      autoIncrement: true
    },
    product_id: { // References the Product model's ID. 
      type: DataTypes.INTEGER, 
      references: {
        model: 'product',
        key: 'id'
      }
    }, 
    tag_id: { // References the Tag model's ID.
      type: DataTypes.INTEGER,
      references: {
        model: 'tag', 
        key: 'id'
      }
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'product_tag',
  }
);

module.exports = ProductTag;
