module.exports = (sequelize, DataTypes) => {
  const Evaluation = sequelize.define("Evaluation", {
    score: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    anonymousToPeers: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  Evaluation.associate = (models) => {
    Evaluation.belongsTo(models.Team, { foreignKey: "TeamId" });
    Evaluation.belongsTo(models.User, {
      as: "evaluator",
      foreignKey: "evaluatorId",
    });
    Evaluation.belongsTo(models.User, {
      as: "evaluatee",
      foreignKey: "evaluateeId",
    });
  };

  return Evaluation;
};
