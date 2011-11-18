describe('Flotr', function () {


  describe('Plots', function () {

    var
      nodeA, nodeB,
      a, b;

    beforeEach(function () {

      // Add imagediff matchers
      this.addMatchers(imagediff.jasmine);

      nodeA = buildNode();
      nodeB = buildNode();
    });

    afterEach(function () {
      destroyNode(nodeA);
      destroyNode(nodeB);
      a = b = null;
    });

    _.each(TestFlotr.ExampleList.examples, function (example, key) {

      it('should draw a `' + example.name + '`line graph', function () {

        a = executeExampleTest(example, StableFlotr, nodeA);
        b = executeExampleTest(example, TestFlotr, nodeB);

        expect(b).toImageDiffEqual(a);
      });
    });

    function executeExampleTest (example, flotr, node) {
      Math.seedrandom(example.key);
      Flotr = flotr;
      example.callback(node);
      return node.graph.ctx;
    }

    function buildNode () {
      var node = document.createElement('div');
      document.body.appendChild(node);
      node.style.width = '320px';
      node.style.height = '240px';
      return node;
    }

    function destroyNode (node) {
      document.body.removeChild(node);
    }
  });

  describe('Main', function () {

    it('gets a tick size', function () {

      expect(Flotr.getTickSize).not.toBeUndefined();
      expect(Flotr.getTickSize(10, 0, 100, 1)).toEqual(10);
      expect(Flotr.getTickSize(20, 0, 100, 1)).toEqual(5);
      expect(Flotr.getTickSize(5, 10, 110, 1)).toEqual(20);
      expect(Flotr.getTickSize(0, 0, 10, 1)).toEqual(Number.POSITIVE_INFINITY);
      expect(isNaN(Flotr.getTickSize(0, 0, -10, 1))).toBeTruthy();
    });
  });
});
