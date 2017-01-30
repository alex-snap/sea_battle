var Client = Client || {};

Client.GameFieldFactory = function(domUtils) {
  this._domUtils = domUtils;
};

Client.GameFieldFactory.prototype.create = function(size, shipsSchema) {

  var table = this._domUtils.createElement('table', { className: 'sea-table m-auto' });
  var body = this._domUtils.createElement('tbody');
  for (var i = 0; i < size; i++) {
    var row = this._createRow();
    for (var j = 0; j < size; j++) {
      var type = (shipsSchema && shipsSchema[j][i] === 1) ? 'busy' : undefined;
      row.appendChild(this._createCell(j, i, type));
    }
    body.appendChild(row);
  }
  table.appendChild(body);
  return table;
};

Client.GameFieldFactory.prototype._createCell = function (x, y, type) {
  var className = 'sea-field__cell js-cell';
  var inner = this._domUtils.createElement('div', { className: 'sea-field__in' });

  switch (type) {
    case 'busy':
      className += ' sea-field__cell--busy';
      break;
    case 'wounded':
      className += ' sea-field__cell--wounded';
      break;
  }

  var cell = this._domUtils.createElement('td', { className: className, 'data-x': x, 'data-y': y });
  cell.appendChild(inner);

  return cell;
};

Client.GameFieldFactory.prototype._createRow = function () {
  return this._domUtils.createElement('tr', { className: 'sea-field__row' });
};