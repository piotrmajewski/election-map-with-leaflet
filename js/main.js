var ElectionMap = (function () {
  var _view = {};
  var _controller = {};
  return {
    controller: function (json) {
      _controller = {
        candidates: [],
        selected: "",
        results: json,
        scaleFactor: function () {
          return Math.pow(2, _view.map.getZoom() - 11) / 12;
        },
        selectFeature: function (feature) {
          if (feature) _view.info.update(feature);
          else {
            _view.info.update();
            _view.info.addListeners();
          }
        },
        addCandidates: function (candidates) {
          this.candidates = candidates;
        },
        selectCandidate: function (candidate) {
          this.selected = candidate;
          _view.updateMap();
          _view.legend.update();
        },
      };
      return _controller;
    },

    view: function (id, getColor, getColors) {
      var _tileUrl =
        "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png";
      var _tileOptions = {
        maxZoom: 15,
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>,' +
          ' &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>' +
          ' &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      };
      var _tiles = {};
      var _getColor = getColor;
      var _getColors = getColors;
      var _bordersOptions = {
        style: function (feature) {
          return {
            fillColor: "#c0c0d0",
            fillOpacity: 0.4,
            color: "#ffffff",
          };
        },
      };
      var _borders = {};
      var _precinctsOptions = {
        style: function (feature) {
          if (_controller.selected) {
            return {
              fillColor: _getColor(
                _controller.results[feature.properties.obwod][
                  _controller.selected
                ] / feature.properties.glosow
              ),
              radius:
                Math.sqrt(feature.properties.glosow) *
                _controller.scaleFactor(),
            };
          } else {
            return {
              fillColor: _getColors(
                _controller.results[feature.properties.obwod][
                  _controller.candidates[0]
                ] / feature.properties.glosow,
                _controller.results[feature.properties.obwod][
                  _controller.candidates[1]
                ] / feature.properties.glosow
              ),
              radius:
                Math.sqrt(feature.properties.glosow) *
                _controller.scaleFactor(),
            };
          }
        },
        pointToLayer: function (feature, latlng) {
          var circle = L.circleMarker(latlng, {
            color: "#000",
            weight: 0,
            opacity: 1,
            fillOpacity: 1,
          });
          return circle;
        },
        onEachFeature: function (feature, layer) {
          layer.on({
            mouseover: function (e) {
              layer.setStyle({
                weight: 1,
              });
              _controller.selectFeature(feature);
            },
            mouseout: function (e) {
              layer.setStyle({
                weight: 0,
              });
              _controller.selectFeature();
            },
          });
        },
      };
      var _precincts = {};
      var _updateMap = function () {
        _precincts.eachLayer(function (layer) {
          if (layer.feature && layer.feature.properties) {
            layer.setStyle(_precinctsOptions.style(layer.feature));
          }
        });
      };

      _view = {
        map: (function () {
          var map = L.map(id);
          map.on({
            zoomend: _updateMap,
          });
          return map;
        })(),

        info: (function () {
          var info = L.control({ position: "bottomright" });
          var _div = L.DomUtil.create("div", "info");
          info.onAdd = function (map) {
            this.update();
            return _div;
          };
          info.update = function (feature) {
            var infoHTML;
            if (feature) {
              var prop = feature.properties;
              infoHTML = "<h4>Precinct no " + prop.obwod + "<br/>";
              var votes = prop.glosow / prop.wyborcow,
                result =
                  Math.floor(votes * 100) +
                  "." +
                  (Math.floor(votes * 1000) % 10) +
                  "%",
                total = _controller.results[prop.obwod]["razem"];
              infoHTML += "Voter turnout: " + result + "</h4>";

              for (var i = 0; i < _controller.candidates.length; i++) {
                votes =
                  _controller.results[prop.obwod][_controller.candidates[i]] /
                  total;
                result =
                  Math.floor(votes * 100) +
                  "." +
                  (Math.floor(votes * 1000) % 10) +
                  "%";
                infoHTML +=
                  "<small>" +
                  _controller.candidates[i] +
                  ": <b>" +
                  result +
                  "</b></small><br>";
              }
            } else {
              infoHTML =
                "<h4>Hover over a precinct to see detailed results, or select the candidate:</h4>" +
                '<small><a id="a" href="#">' +
                _controller.candidates[0] +
                " vs. " +
                _controller.candidates[1] +
                "</a></small><br>";
              for (var i = 0; i < _controller.candidates.length; i++) {
                infoHTML +=
                  '<small><a id="a' +
                  i +
                  '" href="#">' +
                  _controller.candidates[i] +
                  "</a></small><br>";
              }
            }
            _div.innerHTML = infoHTML;
          };
          info.addListeners = function () {
            for (var i = 0; i < _controller.candidates.length; i++) {
              document.getElementById("a").addEventListener(
                "click",
                (function () {
                  return function (e) {
                    e.preventDefault();
                    _controller.selectCandidate("");
                  };
                })()
              );
              document.getElementById("a" + i).addEventListener(
                "click",
                (function (kandydat) {
                  return function (e) {
                    e.preventDefault();
                    _controller.selectCandidate(kandydat);
                  };
                })(_controller.candidates[i])
              );
            }
          };
          return info;
        })(),

        legend: (function () {
          var grades = [0, 10, 20, 30, 40, 50, 60, 70, 80],
            labels = [],
            labels2d = [],
            from,
            to;

          for (var i = 0; i < grades.length - 1; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(
              '<i style="background:' +
                _getColor((from + 5) * 0.01) +
                '"></i>&nbsp;' +
                from +
                "%&ndash;" +
                to +
                "%"
            );
            var label = "";
            for (var j = 0; j < grades.length - i - (i == 0 ? 1 : 0); j++) {
              label +=
                '<i style="background:' +
                _getColors((grades[j] + 5) * 0.01, (grades[i] + 5) * 0.01) +
                '"></i> ';
            }
            labels2d.push(label);
          }
          var _labels = "<div>" + labels.join("<br/>") + "</div>";
          var _labels2d =
            "<div>0%</div>" +
            '<div id="tiles">' +
            labels2d.join("<br/>") +
            "</div><div>80%</div>" +
            "<div>80%</div>";
          var _div = L.DomUtil.create("div", "info legend");
          var legend = L.control();

          legend.onAdd = function (map) {
            this.update();
            return _div;
          };
          legend.update = function (feature) {
            var innerHTML =
              "<h3>Results of the 21 October 2018 election for the Mayor of Warsaw</h3>";
            if (_controller.selected) {
              innerHTML +=
                "<h4>" +
                _controller.selected +
                "</h4>" +
                '<div class="pl-30">' +
                _labels +
                "</div>";
            } else {
              innerHTML +=
                '<div class="pl-30">' +
                "<h4>" +
                _controller.candidates[0] +
                "</h4>" +
                '<div class="labels2d">' +
                _labels2d +
                "</div>" +
                "<div>" +
                '<h4 class="vertical-head">' +
                _controller.candidates[1] +
                "</h4></div></div>";
            }
            _div.innerHTML = innerHTML;
          };
          return legend;
        })(_getColor, _getColors),

        updateMap: _updateMap,

        addTiles: function () {
          _tiles = L.tileLayer(_tileUrl, _tileOptions);
        },

        addBorders: function (json) {
          _borders = L.geoJSON(json, _bordersOptions);
        },

        addPrecincts: function (json) {
          _precincts = L.geoJSON(json, _precinctsOptions);
        },

        show: function () {
          _tiles.addTo(this.map);
          _borders.addTo(this.map);
          _precincts.addTo(this.map);
          this.legend.addTo(this.map);
          this.info.addTo(this.map);
          this.info.addListeners();
          this.map.setView([52.24, 21.08], 11);
        },
      };
      return _view;
    },
  };
})();
