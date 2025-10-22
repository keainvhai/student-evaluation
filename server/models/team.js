module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define("Team", {
    name: DataTypes.STRING,
  });

  Team.associate = (models) => {
    Team.belongsTo(models.Course, { foreignKey: "courseId" });
    Team.hasMany(models.TeamMembership, { foreignKey: "teamId" });
    Team.hasMany(models.Evaluation, { foreignKey: "teamId" });
    Team.hasMany(models.EvaluationRequest, { foreignKey: "teamId" });
  };

  return Team;
};
