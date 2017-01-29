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

SeaBattle.ShipSchemaFactory = function () {};

/**
 * @param {number} size
 * @param {SeaBattle.AvailableShip[]} availableShips
 * @public
 */
SeaBattle.ShipSchemaFactory.prototype.createRandom = function (size, availableShips) {
  var readableExample = [
    { x1: 4, y1: 0, x2: 4, y2: 0 },  //1
    { x1: 7, y1: 0, x2: 7, y2: 0 },  //1
    { x1: 2, y1: 1, x2: 2, y2: 1 },  //1
    { x1: 5, y1: 2, x2: 5, y2: 2 },  //1

    { x1: 7, y1: 2, x2: 8, y2: 2 },  //2
    { x1: 1, y1: 3, x2: 2, y2: 3 },  //2
    { x1: 7, y1: 4, x2: 7, y2: 5 },  //2

    { x1: 0, y1: 5, x2: 2, y2: 5 },  //3
    { x1: 5, y1: 4, x2: 5, y2: 6 },  //3

    { x1: 5, y1: 8, x2: 8, y2: 8 }  //4
  ];

  var result = [];
  for (var i = 0; i < readableExample.length; i++) {
    var ship = readableExample[i];
    for (var x = ship.x1; x <= ship.x2; x++) {
      result[x] = result[x] || [];
      for (var y = ship.y1; y <= ship.y2; y++) {
        result[x][y] = { busy: true };
      }
    }
  }

  return result;
};