(function () {

var 
  _             = Flotr._,

  DOT           = '.',

  CN_EXAMPLE    = 'flotr-example',
  CN_LABEL      = 'flotr-example-label',
  CN_TITLE      = 'flotr-example-title',
  CN_MARKUP     = 'flotr-example-description',
  CN_EDITOR     = 'flotr-example-editor',

  ID_GRAPH      = 'flotr-example-graph',

  TEMPLATE      = '' +
    '<div class="' + CN_EXAMPLE + '">' +
      '<div class="' + CN_LABEL + ' ' + CN_TITLE + '"></div>' +
      '<div class="' + CN_MARKUP + '"></div>' +
      '<div class="' + CN_EDITOR + '"></div>' +
    '</div>',

Example = function (o) {

  this.options = o;
  this.example = null;

  this._initNodes();
};

Example.prototype = {

  setExample : function (example) {

    this.example = example;

    Math.seedrandom(example.key);
    this._exampleNode.css({ display: 'block' });

    if (!this._editor) {
      this._editor = new Flotr.Examples.Editor(this._editorNode, {
          example : example.callback
      });
    } else {
      this._editor.setExample(example.callback);
    }
  },

  executeCallback : function (example, node) {
    if (!_.isElement(node)) node = node[0];
    var args = (example.args ? [node].concat(example.args) : [node]);
    Math.seedrandom(example.key);
    return example.callback.apply(this, args);
  },

  _initNodes : function () {

    var
      node    = this.options.node,
      example = $(TEMPLATE);

    this._titleNode   = example.find(DOT + CN_TITLE);
    this._markupNode  = example.find(DOT + CN_MARKUP);
    this._editorNode  = example.find(DOT + CN_EDITOR);
    this._exampleNode = example;

    node.append(example);
  }
};

Flotr.Examples.Example = Example;

})();
