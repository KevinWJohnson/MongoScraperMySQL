module.exports = function(sequelize, DataTypes) {
  var article = sequelize.define("article", {
      id: {
          type: DataTypes.UUID,
          allowNull: false,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
      },
      title: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      summary: {
          type: DataTypes.STRING,
          allowNull: false
      },
      byline: {
          type: DataTypes.STRING,
      },
      favorite: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
      },
      noteID: {
        type: DataTypes.UUID
      },
      createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
      }
  });


  return article;
};
