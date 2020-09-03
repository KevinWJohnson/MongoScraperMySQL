module.exports = function(sequelize, DataTypes) {
  var note = sequelize.define("note", {
      id: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
      },
      title: {
          type: DataTypes.STRING,
      },
      body: {
          type: DataTypes.STRING,
      },
      createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
      }
  });
  return note;
};