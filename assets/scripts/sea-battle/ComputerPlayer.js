var SeaBattle = SeaBattle || {};

SeaBattle.ComputerPlayer = function() {};

/**
 * @public
 * @param enemyFireSchema
 * @param {number} fieldSize
 * @returns {{x: number, y: number}}
 */
SeaBattle.ComputerPlayer.prototype.fire = function(enemyFireSchema, fieldSize) {
  var notFiredFields = [];
  for (var y = 0; y < fieldSize; y++) {
    for (var x = 0; x < fieldSize; x++) {
      if (!enemyFireSchema[x] || typeof enemyFireSchema[x][y] !== 'number') {
        notFiredFields.push({ x: x, y: y });
      }
    }
  }
  var random = Math.floor(Math.random() * (notFiredFields.length - 1));

  return notFiredFields[random];
};