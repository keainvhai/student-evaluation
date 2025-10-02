module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Course", {
    title: DataTypes.STRING,
    code: DataTypes.STRING,
    joinToken: DataTypes.STRING,
  });
};
