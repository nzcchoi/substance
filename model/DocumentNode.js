'use strict';

var $ = require('../util/jquery');
var _ = require('../util/helpers');
var DataNode = require('./data/Node');

var DocumentNode = DataNode.extend({
  displayName: "DocumentNode",
  name: "node",

  attach: function(document) {
    this.document = document;
    this.didAttach(document);
  },

  detach: function() {
    var doc = this.document;
    _.each(this.constructor.schema, function(type, propertyName) {
      doc.getEventProxy('path').remove([this.id, propertyName], this);
    });
    this.document = null;
    this.didDetach(doc);
  },

  didAttach: function() {},

  didDetach: function() {},

  isAttached: function() {
    return this.document !== null;
  },

  getDocument: function() {
    return this.document;
  },

  hasParent: function() {
    return !!this.parent;
  },

  getParent: function() {
    return this.document.get(this.parent);
  },

  hasChildren: function() {
    return false;
  },

  getChildIndex: function(child) {
    /* jshint unused:false */
    return -1;
  },

  getChildAt: function(idx) {
    /* jshint unused:false */
    return null;
  },

  getChildCount: function() {
    return 0;
  },

  getRoot: function() {
    var node = this;
    while (node.hasParent()) {
      node = node.getParent();
    }
    return node;
  },

  getComponents: function() {
    var componentNames = this.constructor.static.components;
    if (!componentNames) {
      console.warn('Contract: a node must define its editable properties.', this.constructor.static.name);
    }
    return componentNames || [];
  },

  getPropertyNameAt: function(idx) {
    var propertyNames = this.constructor.static.components || [];
    return propertyNames[idx];
  },

  // volatile property necessary to render highlighted node differently
  setHighlighted: function(highlighted) {
    if (this.highlighted !== highlighted) {
      this.highlighted = highlighted;
      this.emit('highlighted', highlighted);
    }
  },

  isExternal: function() {
    return this.constructor.static.external;
  },

  // Note: children are provided for inline nodes only.
  toHtml: function(converter, children) {
    return this.constructor.static.toHtml(this, converter, children);
  },

  connect: function(ctx, handlers) {
    _.each(handlers, function(func, name) {
      var match = /([a-zA-Z_0-9]+):changed/.exec(name);
      if (match) {
        var propertyName = match[1];
        if (this.constructor.static.schema[propertyName]) {
          this.getDocument().getEventProxy('path').add([this.id, propertyName], this, this._onPropertyChange.bind(this, propertyName));
        }
      }
    }, this);
    DataNode.prototype.connect.apply(this, arguments);
  },

  disconnect: function() {
    // TODO: right now do not unregister from the event proxy
    // when there is no property listener left
    // We would need to implement disconnect
    DataNode.prototype.disconnect.apply(this, arguments);
  },

  _onPropertyChange: function(propertyName) {
    var args = [propertyName + ':changed']
      .concat(Array.prototype.slice.call(arguments, 1));
    this.emit.apply(this, args);
  },

});

// default HTML serialization
DocumentNode.static.toHtml = function(node, converter) {
  var $el = $('<div itemscope>')
    .attr('data-id', node.id)
    .attr('data-type', node.type);
  _.each(node.properties, function(value, name) {
    var $prop = $('<div>').attr('itemprop', name);
    if (node.getPropertyType === 'string') {
      $prop[0].appendChild(converter.annotatedText([node.id, name]));
    } else {
      $prop.text(value);
    }
    $el.append($prop);
  });
  return $el;
};

DocumentNode.static.external = false;

module.exports = DocumentNode;
