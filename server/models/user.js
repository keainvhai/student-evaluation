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
  return User;
};
