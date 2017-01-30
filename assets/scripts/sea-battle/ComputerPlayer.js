var SeaBattle = SeaBattle || {};

SeaBattle.ComputerPlayer.DifficultLevelEnum = {
  Easy: 0,
  Hard: 1
};

SeaBattle.ComputerPlayer = function() {
};

/**
 * @public
 * @param {Array<Array<number>>} enemyFireSchema
 * @returns {{x: number, y: number}}
 */
SeaBattle.ComputerPlayer.prototype.fire = function(enemyFireSchema) {
  if (this._fieldSize && this._availableShips) {
    switch (this._defficultLevel) {
      case SeaBattle.ComputerPlayer.DifficultLevelEnum.Hard:
        return this._fireHard(enemyFireSchema);
      case SeaBattle.ComputerPlayer.DifficultLevelEnum.Easy:
      default:
        return this._fireEasy(enemyFireSchema);
    }
  }
  throw new Error('SeaBattle.ComputerPlayer#fire(): invalid settings');
};

SeaBattle.ComputerPlayer.prototype.setSettings = function(fieldSize, availableShips, difficultLevel) {
  this._fieldSize = fieldSize;
  this._defficultLevel = difficultLevel || SeaBattle.ComputerPlayer.DifficultLevelEnum.Easy;
  this._availableShips = availableShips;
};

SeaBattle.ComputerPlayer.prototype._fireEasy = function(enemyFireSchema, fieldSize) {
  var notFiredFields = [];
  for (var y = 0; y < this._fieldSize; y++) {
    for (var x = 0; x < this._fieldSize; x++) {
      if (!enemyFireSchema[x] || typeof enemyFireSchema[x][y] !== 'number') {
        notFiredFields.push({ x: x, y: y });
      }
    }
  }
  var random = Math.floor(Math.random() * (notFiredFields.length - 1));

  return notFiredFields[random];
};

/**
 * @private
 * @param {Array<Array<number>>} enemyFireSchema
 * @param {number} fieldSize
 */
SeaBattle.ComputerPlayer.prototype._fireHard = function(enemyFireSchema, fieldSize) {

};