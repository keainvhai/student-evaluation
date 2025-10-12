module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Course", {
    title: DataTypes.STRING,
    code: DataTypes.STRING,
    joinToken: DataTypes.STRING,
    description: {
      type: DataTypes.TEXT, // 用 TEXT 比 STRING 更适合存课程简介
      allowNull: true,
    },
    aiEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // 默认禁用
    },
  });
};
