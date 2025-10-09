// server/models/evaluationRequest.js
module.exports = (sequelize, DataTypes) => {
  const EvaluationRequest = sequelize.define("EvaluationRequest", {
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requesteeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      defaultValue: "pending",
    },
  });

  return EvaluationRequest;
};
