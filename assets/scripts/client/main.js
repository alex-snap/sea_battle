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
    var self = this;

    this._game.stateSubject.subscribe(this._onGameStateChange.bind(this));

    // on click Generate ships button
    this._elms.generateShipsBtn.addEventListener('click', function () {
      self._humanShipsSchema = self._gameShipSchemaFactory.createRandom(self._gameRules.FIELD_SIZE, self._gameRules.AVAILABLE_SHIPS);
      var gameFieldElement = self._gameFieldFactory.create(self._gameRules.FIELD_SIZE, self._humanShipsSchema);
      self._elms.userFieldWrap.innerHTML = '';
      self._elms.userFieldWrap.appendChild(gameFieldElement);
      self._showEl(self._elms.gameStartBtn);
    });

    // on click Start game
    this._elms.gameStartBtn.addEventListener('click', function () {
      var computerShipsSchema = self._gameShipSchemaFactory.createRandom(self._gameRules.FIELD_SIZE, self._gameRules.AVAILABLE_SHIPS);
      var participants = [
        { id: self._playersIds.human, shipsSchema: self._humanShipsSchema },
        { id: self._playersIds.computer, shipsSchema: computerShipsSchema }
      ];
      self._game.start(participants, self._gameRules.FIELD_SIZE);
    });

    // on click Restart game
    this._elms.gameRestartBtn.addEventListener('click', function () {
      self._transitToPreparing();
    });

    // on click Computer cell
    this._Utils.DOM.delegate('.js-cell', 'click', function (event) {
      var element = event.target;
      var x = element.getAttribute('data-x');
      var y = element.getAttribute('data-y');
      var fireResult = self._game.fire(self._playersIds.human, x, y);

      switch (fireResult) {
        case 'hit':
          self._hitCell(element);
          break;
        case 'miss':
          self._missCell(element);
          break;
        default:
          console.log('nothing');
          break;
      }
    }, this._elms.computerFieldWrap);
  },

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

  _hitCell: function(element) {
    this._Utils.DOM.addClass(element, this._classNames.woundedCell);
  },
  _missCell: function(element) {
    this._Utils.DOM.addClass(element, this._classNames.missedCell);
  },

  _hidePreparingElements: function() {
    this._showEl(this._elms.computerFieldWrap);
    this._showEl(this._elms.gameRestartBtn);
    this._hideEl(this._elms.gameStartBtn);
    this._hideEl(this._elms.gameStartBtn);
    this._hideEl(this._elms.generateShipsBtn);
  },

  // helpers
  _showEl: function (element) {
    this._setElementStyle(element, { display: '' });
  },
  _hideEl: function (element) {
    this._setElementStyle(element, { display: 'none' });
  },
  _setElementStyle: function (element, styles) {
    if (element != null) {
      if (element instanceof NodeList) {
        for (var i = 0; i < element.length; i++) {
          for (style in styles) {
            if (styles.hasOwnProperty(style)) {
              element[i].style[style] = styles[style];
            }
          }
        }
      } else {
        for (style in styles) {
          if (styles.hasOwnProperty(style)) {
            element.style[style] = styles[style];
          }
        }
      }
    }
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