module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Evaluation", {
    score: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    anonymousToPeers: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
};
