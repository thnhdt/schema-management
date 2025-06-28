
import { sequelize } from '../config/connection.js'
import { DataTypes, UUID } from 'sequelize';
export const patient = sequelize.define('patient', {
  id: {
    type: DataTypes.INTEGER, allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: { type: DataTypes.STRING, },
  lastName: { type: DataTypes.STRING, },
  email: { type: DataTypes.STRING, },
  createdAt: { type: DataTypes.DATE, allowNull: false }
});