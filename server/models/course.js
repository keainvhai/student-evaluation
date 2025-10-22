module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
    title: DataTypes.STRING,
    code: DataTypes.STRING,
    joinToken: DataTypes.STRING,
    description: { type: DataTypes.TEXT, allowNull: true },
    aiEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: "instructor",
      foreignKey: "instructorId",
    });
    Course.hasMany(models.Enrollment, { foreignKey: "courseId" });
    Course.hasMany(models.Team, { foreignKey: "courseId" });
  };

  return Course;
};
