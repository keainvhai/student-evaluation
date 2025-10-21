module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {});

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, { foreignKey: "UserId" });
    Enrollment.belongsTo(models.Course, { foreignKey: "CourseId" });
  };

  return Enrollment;
};
