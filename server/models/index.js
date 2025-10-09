const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 模型
db.User = require("./user")(sequelize, DataTypes);
db.Course = require("./course")(sequelize, DataTypes);
db.Enrollment = require("./enrollment")(sequelize, DataTypes);
db.Team = require("./team")(sequelize, DataTypes);
db.TeamMembership = require("./teamMembership")(sequelize, DataTypes);
db.Evaluation = require("./evaluation")(sequelize, DataTypes);
db.EvaluationRequest = require("./EvaluationRequest")(sequelize, DataTypes);

// 关联
db.Course.belongsTo(db.User, { as: "instructor", foreignKey: "instructorId" });
db.User.hasMany(db.Course, { foreignKey: "instructorId" });

// db.Enrollment.belongsTo(db.User);
db.Enrollment.belongsTo(db.User, { foreignKey: "UserId" });
// db.Enrollment.belongsTo(db.Course);
db.Enrollment.belongsTo(db.Course, { foreignKey: "CourseId" });

// db.User.hasMany(db.Enrollment);
db.User.hasMany(db.Enrollment, { foreignKey: "UserId" });
// db.Course.hasMany(db.Enrollment);
db.Course.hasMany(db.Enrollment, { foreignKey: "CourseId" });

db.Team.belongsTo(db.Course);
db.Course.hasMany(db.Team);

db.TeamMembership.belongsTo(db.Team);
db.TeamMembership.belongsTo(db.User);
db.Team.hasMany(db.TeamMembership);
db.User.hasMany(db.TeamMembership);

db.Evaluation.belongsTo(db.Team);
db.Evaluation.belongsTo(db.User, {
  as: "evaluator",
  foreignKey: "evaluatorId",
});
db.Evaluation.belongsTo(db.User, {
  as: "evaluatee",
  foreignKey: "evaluateeId",
});

// ===== EvaluationRequest 关联 =====
db.EvaluationRequest.belongsTo(db.Team, { foreignKey: "teamId" });
db.Team.hasMany(db.EvaluationRequest, { foreignKey: "teamId" });

db.EvaluationRequest.belongsTo(db.User, {
  as: "Requester",
  foreignKey: "requesterId",
});
db.User.hasMany(db.EvaluationRequest, {
  as: "RequestsSent",
  foreignKey: "requesterId",
});

db.EvaluationRequest.belongsTo(db.User, {
  as: "Requestee",
  foreignKey: "requesteeId",
});
db.User.hasMany(db.EvaluationRequest, {
  as: "RequestsReceived",
  foreignKey: "requesteeId",
});

module.exports = db;
