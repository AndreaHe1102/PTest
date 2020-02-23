var width = 750,
  height = 600;

var selectedWave = "wave3";
var filterArray;

var color = d3
  .scaleThreshold()
  .domain([
    5,
    10,
    15,
    20,
    25,
    30,
    35,
    40,
    45,
    50,
    55,
    60,
    65,
    70,
    75,
    80,
    85,
    90,
    95,
    100
  ])
  .range([
    "#D7FFFB",
    "#C8FFFF",
    "#B9FFFF",
    "#AAF6FF",
    "#9BE8FF",
    "#8DD7FF",
    "#7FC2FF",
    "#71ABFF",
    "#6491FF",
    "#5774FF",
    "#4945F2",
    "#5340E6",
    "#5B3CD9",
    "#6237CC",
    "#6833BF",
    "#6C2FB3",
    "#6F2AA6",
    "#712699",
    "#71228C",
    "#701F80"
  ]);

var svg;
var map;
var legend_svg;

svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

map = svg.append("g").attr("class", "map");

legend_svg = d3
  .select("#legend_container")
  .append("svg")
  .attr("width", 100)
  .attr("height", 600);

//tooltip
var tooltip = d3
  .select("#map")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("padding", "5px");

var mouseover = function(d) {
  tooltip.style("opacity", 1);
  d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1);
};

var mousemove = function(d) {
  var value;

  if (d.details.value == undefined) {
    value = " No data";
  } else {
    value = d.details.value + " %";
  }

  tooltip
    .html(d.properties.name + "<br>" + filterArray + ": " + value)
    .style("left", d3.mouse(this)[0] + 70 + "px")
    .style("top", d3.mouse(this)[1] + "px")
    .style("color", "white");
};

var mouseout = function(d) {
  tooltip.style("opacity", 0);
  d3.select(this)
    .style("stroke", "white")
    .style("opacity", 0.8);
};

setActiveButton();
addEventListeners();
drawLegend();
resetMap();

function fixData(data) {
  var orderedData = 0;

  if (filterArray != 0) {
    orderedData = parseFloat(data[filterArray]);
  }
  return orderedData;
}

function getData() {
  d3.queue()
    .defer(d3.json, "./data/worldmap.json")
    .defer(d3.json, "./data/wave3.json")
    .defer(d3.json, "./data/wave4.json")
    .defer(d3.json, "./data/wave5.json")
    .defer(d3.json, "./data/wave6.json")
    .await(function(error, world, wave3, wave4, wave5, wave6) {
      if (error) throw error;

      if (filterArray != 0) {
        if (selectedWave == "wave3") {
          drawMap(world, wave3);
        } else if (selectedWave == "wave4") {
          drawMap(world, wave4);
        } else if (selectedWave == "wave5") {
          drawMap(world, wave5);
        } else if (selectedWave == "wave6") {
          drawMap(world, wave6);
        }
      }
    });
}

function drawLegend() {
  legend_svg
    .append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");

  var labels = [
    "5%",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ">90%"
  ];
  var legend = d3
    .legendColor()
    .labels(function(d) {
      return labels[d.i];
    })
    .shapePadding(4)
    .scale(color);
  legend_svg.select(".legendThreshold").call(legend);
}

function drawMap(world, data) {
  var projection = d3
    .geoMercator()
    .scale(140)
    .translate([width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  var features = topojson.feature(world, world.objects.countries).features;
  var dataObject = {};

  for (var item in data) {
    dataObject[item] = {
      value: fixData(data[item])
    };
  }

  features.forEach(function(d, i) {
    if (dataObject[d.properties.name]) {
      d.details = dataObject[d.properties.name];
    } else {
      d.details = {};
    }
  });

  map
    .append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .attr("name", function(d) {
      return d.properties.name;
    })
    .attr("id", function(d) {
      return d.id;
    })
    .attr("d", path)
    .style("fill", function(d) {
      return d.details && d.details.value ? color(d.details.value) : undefined;
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);
}

function resetMap() {
  d3.select(".map")
    .selectAll("g")
    .remove();
  filter("Determination");
}

function filter(filter) {
  d3.select(".map")
    .selectAll("g")
    .transition()
    .duration(1000)
    .remove();
  filterArray = filter;
  getData();
  drawLegend();
}

function setWave(wave) {
  selectedWave = wave;
  getData();
}

function addEventListeners() {
  document.getElementById("qDetermination").onclick = function() {
    filter("Determination", "qDetermination");
  };
  document.getElementById("qHardWork").onclick = function() {
    filter("Hard_work", "qHardWork");
  };
  document.getElementById("qImagination").onclick = function() {
    filter("Imagination", "qImagination");
  };
  document.getElementById("qIndependence").onclick = function() {
    filter("Independence", "qIndependence");
  };
  document.getElementById("qReligiousFaith").onclick = function() {
    filter("Religious_faith", "qReligiousFaith");
  };
  document.getElementById("qResponsibility").onclick = function() {
    filter("Responsibility", "qResponsibility");
  };
  document.getElementById("qSavingMoney").onclick = function() {
    filter("Thrift_saving", "qSavingMoney");
  };
  document.getElementById("qToleranceRespect").onclick = function() {
    filter("Tolerance_respect", "qToleranceRespect");
  };

  document.getElementById("wave3").onclick = function() {
    setWave("wave3");
  };
  document.getElementById("wave4").onclick = function() {
    setWave("wave4");
  };
  document.getElementById("wave5").onclick = function() {
    setWave("wave5");
  };
  document.getElementById("wave6").onclick = function() {
    setWave("wave6");
  };
}

function setActiveButton() {
  var btnContainer = document.getElementById("filterButtons");
  var btns = btnContainer.getElementsByClassName("btn");

  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function() {
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
}
