module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define("Enrollment", {});

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, { foreignKey: "userId" });
    Enrollment.belongsTo(models.Course, { foreignKey: "courseId" });
  };

  return Enrollment;
};
