var SeaBattle = SeaBattle || {};


/**
 * @typedef {} SeaBattle.ShipSchema
 * @property {number} SeaBattle.ShipSchema.x1
 * @property {number} SeaBattle.ShipSchema.y1
 * @property {number} SeaBattle.ShipSchema.x2
 * @property {number} SeaBattle.ShipSchema.y1
 */

/**
 * @typedef {} SeaBattle.AvailableShip
 * @property {number} SeaBattle.AvailableShip.length
 * @property {number} SeaBattle.AvailableShip.count
 */

SeaBattle.ShipSchemaFactory = function () {
};

/**
 * @param {number} size
 * @param {SeaBattle.AvailableShip[]} availableShips
 * @public
 */
SeaBattle.ShipSchemaFactory.prototype.createRandom = function (size, availableShips) {

  var allDescSortedShips = this._getAllShips(availableShips);
  var shipsSchema = this._createEmptyShipsSchema(size);

  for (var i = 0; i < allDescSortedShips.length; i++) {
    var ship = allDescSortedShips[i];
    /**
     * @type {Array.<Array.<{x: number, y: number}>>}
     */
    var shipPossiblePositions = this._getPossiblePositions(ship, shipsSchema);
    /**
     * @type {number}
     */
    var randomPosition = this._getRandom(0, shipPossiblePositions.length - 1);
    /**
     * @type {Array.<{x: number, y: number}>}
     */
    var shipOccupiedCells = shipPossiblePositions[randomPosition];
    this._takeCellsInSchema(shipOccupiedCells, shipsSchema);
  }

  return shipsSchema;
};

/**
 * @private
 * @param {number} ship
 * @param {Array.<Array<number>>} shipsSchema
 * @return {Array.<Array<{x: number, y: number}>>}
 */
SeaBattle.ShipSchemaFactory.prototype._getPossiblePositions = function(ship, shipsSchema) {
  var positions = [];
  var size = shipsSchema.length;
  var sizeShipDiff = size - ship;
  var shipVerticalOccupiedCells;
  var shipHorizontalOccupiedCells;
  var i;

  for (var y = 0; y <= sizeShipDiff; y++) {
    for (var x = 0; x <= sizeShipDiff; x++) {
      shipHorizontalOccupiedCells = [];
      shipVerticalOccupiedCells = [];

      // vertical positions
      for (i = y; i < ship + y; i++) {
        shipVerticalOccupiedCells.push({ x: x, y: i });
      }
      if (this._canPlaceShip(shipVerticalOccupiedCells, shipsSchema)){
        positions.push(shipVerticalOccupiedCells);
      }

      // horizontal positions
      for (i = x; i < ship + x; i++) {
        shipHorizontalOccupiedCells.push({ x: i, y: y });
      }
      if (this._canPlaceShip(shipHorizontalOccupiedCells, shipsSchema)){
        positions.push(shipHorizontalOccupiedCells);
      }
    }
  }


  return positions;
};

/**
 * @private
 * @param {Array.<{x: number, y: number}>} shipOccupiedCells
 * @param {Array.<Array<number>>} shipsSchema
 * @returns {boolean}
 */
SeaBattle.ShipSchemaFactory.prototype._canPlaceShip = function(shipOccupiedCells, shipsSchema) {
  var canPlace = true;
  var checkRange = {
    from: { x: -1, y: -1 },
    to: { x: 1, y: 1 }
  };

  loop:
  for (var i = 0; i < shipOccupiedCells.length; i++) {
    var cell = shipOccupiedCells[i];
    for (var x = cell.x + checkRange.from.x; x <= cell.x + checkRange.to.x; x++) {
      for (var y = cell.y + checkRange.from.y; y <= cell.y + checkRange.to.y; y++) {
        if (shipsSchema[x] && shipsSchema[x][y] && shipsSchema[x][y] === 1) {
          canPlace = false;
          break loop;
        }
      }
    }
  }

  return canPlace;
};



/**
 * mutate array
 * @private
 * @param {Array.<{x: number, y: number}>} shipOccupiedCells
 * @param {Array.<Array.<number>>} shipsSchema
 */
SeaBattle.ShipSchemaFactory.prototype._takeCellsInSchema = function(shipOccupiedCells, shipsSchema) {
  var occupiedCell;
  for (var i = 0; i < shipOccupiedCells.length; i++) {
    occupiedCell = shipOccupiedCells[i];
    shipsSchema[occupiedCell.x][occupiedCell.y] = 1;
  }
};

/**
 * @private
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
SeaBattle.ShipSchemaFactory.prototype._getRandom = function(from, to) {
  return Math.floor(Math.random() * (to - from) + from);
};

/**
 * @private
 * @param {SeaBattle.AvailableShip[]} availableShips
 * @returns {Array<number>}
 */
SeaBattle.ShipSchemaFactory.prototype._getAllShips = function (availableShips) {
  var transformShipRecordToShipsCollection = function (result, availableShip) {
    for (var i = 0; i < availableShip.count; i++) {
      result.push(availableShip.length);
    }
    return result;
  };
  var shipsDescByLength = function(a, b) { return b - a };

  return availableShips
    .reduce(transformShipRecordToShipsCollection, [])
    .sort(shipsDescByLength);
};

/**
 * @private
 * @param {number} size
 * @returns {Array}
 */
SeaBattle.ShipSchemaFactory.prototype._createEmptyShipsSchema = function (size) {
  var shipsSchema = [];
  for (var i = 0; i < size; i++) {
    shipsSchema[i] = [];
    for (var j = 0; j < size; j++) {
      shipsSchema[i][j] = 0;
    }
  }

  return shipsSchema;
};
