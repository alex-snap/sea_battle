var SeaBattle = SeaBattle || {};

SeaBattle.Game = function(BehaviourSubject) {
  this._state = {
    status: SeaBattle.Game.StatusEnum.Created,
    currentPlayerId: 0,
    fireSchema: {},
    winPlayerId: null
  };

  this.stateSubject = new BehaviourSubject(this._state);
};

SeaBattle.Game.StatusEnum = {
  Created: 'created',
  Gaming: 'gaming',
  GameOver: 'gameOver',
  Restart: 'restart'
};

SeaBattle.Game.prototype.start = function(participants, fieldSize) {
  this._participants = participants;
  this._fieldSize = fieldSize;

  this._state.fireSchema[participants[0].id] = [];
  this._state.fireSchema[participants[1].id] = [];
  this._state.currentPlayerId = participants[0].id;
  this._state.status = SeaBattle.Game.StatusEnum.Gaming;
  this.stateSubject.emit(this._state);
};

/**
 * public
 * @param {string|number} playerId
 * @param {string|number} x
 * @param {string|number} y
 * @returns {'hit'|'miss'|undefined}
 */
SeaBattle.Game.prototype.fire = function(playerId, x, y) {
  var x = Number(x);
  var y = Number(y);
  var result;

  if (this._state.currentPlayerId === playerId && this._state.status === SeaBattle.Game.StatusEnum.Gaming) {
    var targetParticipant = this._participants.filter(function(participant) { return participant.id !== playerId; })[0];
    var targetFireSchema = this._state.fireSchema[targetParticipant.id];
    var targetShipsSchema = targetParticipant.shipsSchema;
    targetFireSchema[x] = targetFireSchema[x] || [];

    if (typeof targetFireSchema[x][y] !== 'number') {
      if (targetShipsSchema[x][y] === 1) {
        targetFireSchema[x][y] = 1;
        result = 'hit';
        var isShipsDestroyed = this._isShipsDestroyed(targetShipsSchema, targetFireSchema);
        if (isShipsDestroyed) {
          this._state.status = SeaBattle.Game.StatusEnum.GameOver;
          this._state.winPlayerId = playerId;
        }
      } else {
        targetFireSchema[x][y] = 0;
        result = 'miss';
        this._state.currentPlayerId = targetParticipant.id;
      }
    }

    this.stateSubject.emit(this._state);
  }

  return result;
};

/**
 * @public
 * @param playerId
 * @returns {Array.<Array<number|undefined>>}
 */
SeaBattle.Game.prototype.getFireSchema = function(playerId) {
  return this._state.fireSchema[playerId];
};

/**
 * @private
 * @param shipsSchema
 * @param fireSchema
 * @returns {boolean}
 */
SeaBattle.Game.prototype._isShipsDestroyed = function(shipsSchema, fireSchema) {
  var result = true;

  for(var i = 0; i < this._fieldSize; i++) {
    for (var j = 0; j < this._fieldSize; j++) {
      if (shipsSchema[i][j] === 1 &&
        (!fireSchema[i] || !fireSchema[i][j] || (typeof fireSchema[i][j] !== 'number'))) {
        result = false;
      }
    }
  }

  return result;
};