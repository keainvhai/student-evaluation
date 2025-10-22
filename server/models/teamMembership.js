module.exports = (sequelize, DataTypes) => {
  const TeamMembership = sequelize.define("TeamMembership", {});

  TeamMembership.associate = (models) => {
    TeamMembership.belongsTo(models.Team, { foreignKey: "teamId" });
    TeamMembership.belongsTo(models.User, { foreignKey: "userId" });
  };

  return TeamMembership;
};
