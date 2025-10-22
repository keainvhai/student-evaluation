// server/models/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(64),
        allowNull: false,
        validate: {
          isIn: [["evaluation_request", "evaluation_received", "general"]],
        },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      body: {
        type: DataTypes.STRING(1000), // 简短摘要就够了
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING(255), // 形如 /teams/123/evaluations
        allowNull: true,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "Notifications",
      timestamps: true,
      // 如果你项目统一用 underscored: true，这里也可以加上
      // underscored: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["read"] },
        { fields: ["createdAt"] },
        // 常用组合索引：用户 + 未读，加速未读角标查询
        { fields: ["userId", "read", "createdAt"] },
      ],
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Notification;
};
