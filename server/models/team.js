module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Team", {
    name: DataTypes.STRING,
  });
};
