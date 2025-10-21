module.exports = (sequelize, DataTypes) => {
  const TeamMembership = sequelize.define("TeamMembership", {});

  TeamMembership.associate = (models) => {
    TeamMembership.belongsTo(models.Team, { foreignKey: "TeamId" });
    TeamMembership.belongsTo(models.User, { foreignKey: "UserId" });
  };

  return TeamMembership;
};
