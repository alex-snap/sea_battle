document.addEventListener('DOMContentLoaded', function() {
  var gameRules = {
    FIELD_SIZE: 10,
    AVAILABLE_SHIPS: [
      { length: 1, count: 4 },
      { length: 2, count: 3 },
      { length: 3, count: 2 },
      { length: 4, count: 1 }
    ]
  };

  Client.main.init(Utils, SeaBattle.Game, SeaBattle.ShipSchemaFactory, SeaBattle.ComputerPlayer, gameRules);
});