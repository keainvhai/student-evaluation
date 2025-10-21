module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("student", "instructor"),
      defaultValue: "student",
    },
    studentId: { type: DataTypes.STRING, allowNull: true },
  });

  User.associate = (models) => {
    User.hasMany(models.Course, { foreignKey: "instructorId" });
    User.hasMany(models.Enrollment, { foreignKey: "UserId" });
    User.hasMany(models.TeamMembership, { foreignKey: "UserId" });

    // Evaluation 关系
    User.hasMany(models.Evaluation, {
      as: "EvaluationsGiven",
      foreignKey: "evaluatorId",
    });
    User.hasMany(models.Evaluation, {
      as: "EvaluationsReceived",
      foreignKey: "evaluateeId",
    });

    // EvaluationRequest
    User.hasMany(models.EvaluationRequest, {
      as: "RequestsSent",
      foreignKey: "requesterId",
    });
    User.hasMany(models.EvaluationRequest, {
      as: "RequestsReceived",
      foreignKey: "requesteeId",
    });
  };

  return User;
};
