(function () {

Flotr.ExampleList.add({
  key : 'basic-bar-stacked',
  name : 'Stacked Bars',
  callback : bars_stacked
});

function bars_stacked (container) {

  var
    d1 = [],
    d2 = [],
    d3 = [],
    graph, i;

  for (i = -10; i < 10; i++) {
    /*
    if (horizontal) {
      d1.push([Math.random(), i]);
      d2.push([Math.random(), i]);
      d3.push([Math.random(), i]);
    } else {
    */
      d1.push([i, Math.random()]);
      d2.push([i, Math.random()]);
      d3.push([i, Math.random()]);
      /*
    }
    */
  }

  graph = Flotr.draw(container,[
    { data : d1, label : 'Serie 1' },
    { data : d2, label : 'Serie 2' },
    { data : d3, label : 'Serie 3' }
  ], {
    legend : {
      backgroundColor : '#D2E8FF' // Light blue 
    },
    bars : {
      show : true,
      stacked : true,
     // horizontal : horizontal,
      barWidth : 0.6
    },
    grid : {
      verticalLines : false
    }
    //spreadsheet : { show : true }
  });
}

})();
