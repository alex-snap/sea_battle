var Client = Client || {};


Client.main = {
  _ViewStateEnum: {
    Blank: 'blank',
    Preparing: 'preparing',
    HumanStep: 'humanStep',
    ComputerStep: 'computerStep',
    GameOver: 'gameOver',
    GameWin: 'gameWin'
  },
  init: function (Utils, SeaBattleGame, SeaBattleShipSchemaFactory, SeaBattleComputerPlayer, gameRules) {
    this._Utils = Utils;
    this._SeaBattleGame = SeaBattleGame;
    this._SeaBattleShipSchemaFactory = SeaBattleShipSchemaFactory;
    this._SeaBattleComputerPlayer = SeaBattleComputerPlayer;
    this._gameRules = gameRules;
    this._viewState = this._ViewStateEnum.Blank;
    this._humanShipsSchema = undefined;

    this._COMPUTER_STEP_DELAY = 1000; // ms

    this._classNames = {
      woundedCell: 'sea-field__cell--wounded',
      missedCell: 'sea-field__cell--missed',
      seaFieldHovered: 'sea-field__in--hovered'
    };

    this._elms = {
      gameWinElements: Utils.DOM.getElements('.js-game-win'),
      gameOverElements: Utils.DOM.getElements('.js-game-over'),
      generateShipsBtn: Utils.DOM.getElement('.js-generate-ships-btn'),
      gameStartBtn: Utils.DOM.getElement('.js-game-start-btn'),
      gameRestartBtn: Utils.DOM.getElement('.js-game-restart-btn'),
      userFieldWrap: Utils.DOM.getElement('.js-user-field-wrap'),
      computerFieldWrap: Utils.DOM.getElement('.js-computer-field-wrap'),
      humanStepElements: Utils.DOM.getElements('.js-human-step'),
      computerStepElements: Utils.DOM.getElements('.js-computer-step')
    };

    this._playersIds = {
      human: 'human',
      computer: 'computer'
    };

    this._game = this._createGame();
    this._gameFieldFactory = this._createFieldFactory();
    this._gameShipSchemaFactory = this._createShipSchemaFactory();
    this._computerPlayer = this._createComputerPlayer();

    this._initHandlers();
    this._transitToPreparing();
  },

  _initHandlers: function () {
    this._game.stateSubject.subscribe(this._onGameStateChange.bind(this));
    this._elms.generateShipsBtn.addEventListener('click', this._onGenerateShipsClicked.bind(this));
    this._elms.gameStartBtn.addEventListener('click', this._onGameStartClicked.bind(this));
    this._elms.gameRestartBtn.addEventListener('click', this._onGameRestartClicked.bind(this));
    this._Utils.DOM.delegate('.js-cell', 'click', this._onComputerCellClicked.bind(this), this._elms.computerFieldWrap);
  },

  // Event handlers
  _onGameStateChange: function (gameState) {
    var status = gameState.status;
    switch (status) {
      case this._SeaBattleGame.StatusEnum.Gaming:
        var currentPlayerId = gameState.currentPlayerId;
        this._hidePreparingElements();
        if (currentPlayerId === this._playersIds.human &&
          this._viewState !== this._ViewStateEnum.HumanStep) {
          this._transitToHumanStep();
        } else if (currentPlayerId === this._playersIds.computer &&
          this._viewState !== this._ViewStateEnum.ComputerStep) {
          this._transitToComputerStep();
        }
        break;
      case this._SeaBattleGame.StatusEnum.GameOver:
        if (this._viewState !== this._ViewStateEnum.GameOver ||
          this._viewState !== this._ViewStateEnum.GameWin) {
          if (gameState.winPlayerId === this._playersIds.human) {
            this._transitToHumanWin();
          } else {
            this._transitToComputerWin();
          }
        }
        break;
    }
  },
  _onComputerCellClicked: function (event) {
    var element = event.target;
    var x = element.getAttribute('data-x');
    var y = element.getAttribute('data-y');
    var fireResult = this._game.fire(this._playersIds.human, x, y);

    switch (fireResult) {
      case 'hit':
        this._hitCell(element);
        break;
      case 'miss':
        this._missCell(element);
        break;
      default:
        console.log('nothing');
        break;
    }
  },
  _onGameStartClicked: function(event) {
    var computerShipsSchema = this._gameShipSchemaFactory.createRandom(
      this._gameRules.FIELD_SIZE,
      this._gameRules.AVAILABLE_SHIPS
    );
    var participants = [
      { id: this._playersIds.human, shipsSchema: this._humanShipsSchema },
      { id: this._playersIds.computer, shipsSchema: computerShipsSchema }
    ];
    this._game.start(participants, this._gameRules.FIELD_SIZE);
  },
  _onGenerateShipsClicked: function(event) {
    this._humanShipsSchema = this._gameShipSchemaFactory.createRandom(this._gameRules.FIELD_SIZE, this._gameRules.AVAILABLE_SHIPS);
    var gameFieldElement = this._gameFieldFactory.create(this._gameRules.FIELD_SIZE, this._humanShipsSchema);
    this._elms.userFieldWrap.innerHTML = '';
    this._elms.userFieldWrap.appendChild(gameFieldElement);
    this._showEl(this._elms.gameStartBtn);
  },
  _onGameRestartClicked: function(event) {
    this._transitToPreparing();
  },

  // Client state transitions
  _transitToPreparing: function () {
    this._elms.userFieldWrap.innerHTML = '';
    this._showEl(this._elms.generateShipsBtn);
    this._showEl(this._elms.userFieldWrap);

    this._hideEl(this._elms.gameRestartBtn);
    this._hideEl(this._elms.computerFieldWrap);
    this._hideEl(this._elms.computerStepElements);
    this._hideEl(this._elms.humanStepElements);
    this._hideEl(this._elms.gameOverElements);
    this._hideEl(this._elms.gameWinElements);
    this._hideEl(this._elms.gameStartBtn);


    var computerFieldElement = this._gameFieldFactory.create(this._gameRules.FIELD_SIZE);
    this._elms.computerFieldWrap.innerHTML = '';
    this._elms.computerFieldWrap.appendChild(computerFieldElement);
  },
  _transitToHumanWin: function() {
    this._showEl(this._elms.gameWinElements);
  },
  _transitToComputerWin: function() {
    this._showEl(this._elms.gameOverElements);
  },
  _transitToHumanStep: function () {
    this._showEl(this._elms.humanStepElements);
    this._hideEl(this._elms.computerStepElements);
    this._Utils.DOM.addClass(this._elms.computerFieldWrap, this._classNames.seaFieldHovered);
  },
  _transitToComputerStep: function () {
    this._hideEl(this._elms.humanStepElements);
    this._showEl(this._elms.computerStepElements);
    this._Utils.DOM.removeClass(this._elms.computerFieldWrap, this._classNames.seaFieldHovered);

    this._computerFire();
  },

  _computerFire: function() {
    var self = this;
    setTimeout(function() {
      var humanShipsFireSchema = self._game.getFireSchema(self._playersIds.human);
      var coords = self._computerPlayer.fire(humanShipsFireSchema, self._gameRules.FIELD_SIZE);
      var result = self._game.fire(self._playersIds.computer, coords.x, coords.y);
      var cell = self._Utils.DOM.getElement('.js-user-field-wrap [data-x="' + coords.x + '"][data-y="' + coords.y + '"]');
      switch(result) {
        case 'hit':
          self._hitCell(cell);
          self._computerFire();
          break;
        case 'miss':
          self._missCell(cell);
          break;
      }
    }, this._COMPUTER_STEP_DELAY);
  },

  _hidePreparingElements: function() {
    this._showEl(this._elms.computerFieldWrap);
    this._showEl(this._elms.gameRestartBtn);
    this._hideEl(this._elms.gameStartBtn);
    this._hideEl(this._elms.gameStartBtn);
    this._hideEl(this._elms.generateShipsBtn);
  },

  // Helpers
  // ---------------
  _hitCell: function(element) {
    this._Utils.DOM.addClass(element, this._classNames.woundedCell);
  },
  _missCell: function(element) {
    this._Utils.DOM.addClass(element, this._classNames.missedCell);
  },
  _showEl: function (element) {
    this._Utils.DOM.setElementStyle(element, { display: '' });
  },
  _hideEl: function (element) {
    this._Utils.DOM.setElementStyle(element, { display: 'none' });
  },
  _createFieldFactory: function () {
    return new Client.GameFieldFactory(this._Utils.DOM);
  },
  _createShipSchemaFactory: function () {
    return new this._SeaBattleShipSchemaFactory();
  },
  _createGame: function () {
    return new this._SeaBattleGame(this._Utils.BehaviourSubject);
  },
  _createComputerPlayer: function() {
    return new this._SeaBattleComputerPlayer();
  }
};