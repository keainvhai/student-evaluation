module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define("Team", {
    name: DataTypes.STRING,
  });

  Team.associate = (models) => {
    Team.belongsTo(models.Course, { foreignKey: "CourseId" });
    Team.hasMany(models.TeamMembership, { foreignKey: "TeamId" });
    Team.hasMany(models.Evaluation, { foreignKey: "TeamId" });
    Team.hasMany(models.EvaluationRequest, { foreignKey: "teamId" });
  };

  return Team;
};
