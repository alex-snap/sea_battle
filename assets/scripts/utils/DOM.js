var Utils = Utils || {};

Utils.DOM = {};

Utils.DOM.getElement = function(selector) {
  return document.querySelector(selector);
};

Utils.DOM.getElements = function(selector) {
  return document.querySelectorAll(selector);
};

Utils.DOM.createElement = function(selector, options) {
  var element = document.createElement(selector);
  for (var option in options) {
    if (options.hasOwnProperty(option)) {
      var isDataOption = /data-/.test(option);
      if (isDataOption) {
        element.setAttribute(option, options[option]);
      } else {
        element[option] = options[option];
      }
    }
  }
  return element;
};

Utils.DOM.removeClass = function(element, className) {
  element.className = element.className.split(' ')
    .filter(function(cn) { return cn !== '' && cn !== className })
    .join(' ');
};

Utils.DOM.addClass = function(element, className) {
  element.className += ' ' + className;
};

Utils.DOM.delegate = function(selector, eventType, handler, elementScope) {
  var listener = function (event) {
    const listeningTarget = Utils.DOM._closest(event.target, selector, elementScope);
    if (listeningTarget) {
      handler.call(listeningTarget, event);
    }
  };
  var target = elementScope || document;
  target.addEventListener(eventType, listener);
  return function() { target.removeEventListener(eventType, listener) };
};

Utils.DOM.setElementStyle = function (element, styles) {
  if (element != null) {
    var elements = element instanceof NodeList ? element : [element];
    for (var i = 0; i < elements.length; i++) {
      for (style in styles) {
        if (styles.hasOwnProperty(style)) {
          elements[i].style[style] = styles[style];
        }
      }
    }
  }
};

Utils.DOM._closest = function(element, selector, scopeElement) {
  if (element.isEqualNode(scopeElement)) {
    return undefined;
  }
  return Utils.DOM._matches.call(element, selector) ? element : Utils.DOM._closest(element.parentElement, selector, scopeElement);
};

Utils.DOM._matches = HTMLElement.prototype.matches ||
  HTMLElement.prototype.webkitMatchesSelector ||
  HTMLElement.prototype.mozMatchesSelector ||
  HTMLElement.prototype.msMatchesSelector;