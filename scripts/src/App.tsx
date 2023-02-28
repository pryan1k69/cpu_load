import React, { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export const App: React.FC = ({}) => {
  const init = async () => {
    var root = am5.Root.new("chartdiv");

    root.setThemes([am5themes_Animated.new(root)]);

    async function generateChartData() {
      return await fetch("/get")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // Моментальная загрузка процессора
          var data_1 = data[0];
          // Усредненная загрузка процессора
          var data_2 = data[1];
          return [
            Object.entries(data_1).map(([key, value]) => ({
              date: +key,
              value,
            })),
            Object.entries(data_2).map(([key, value]) => ({
              date: +key,
              value,
            })),
          ];
        });
    }

    var data = await generateChartData();

    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        focusable: true,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );
    chart
      ?.get("colors")
      ?.set("colors", [am5.color(0xff0000), am5.color(0x00ff00)]);

    var easing = am5.ease.linear;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.5,
        extraMin: -0.1,
        extraMax: 0.1,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series1 = chart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY}",
        }),
      })
    );
    var series2 = chart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        name: "Series 2",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY}",
        }),
      })
    );
    series1.data.setAll(data[0]);
    series2.data.setAll(data[1]);

    series1.set("fill", am5.color("#ff0000"));
    series2.set("fill", am5.color("#00ff00"));

    series1.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: undefined,
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: series1.get("fill"),
        }),
      });
    });
    series2.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: undefined,
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: series2.get("fill"),
        }),
      });
    });

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: xAxis,
      })
    );
    cursor.lineY.set("visible", false);

    setInterval(() => {
      addData();
    }, 5000);

    async function addData() {
      const newData = await generateChartData();
      console.log(newData)

      series1.data.setAll(newData[0]);
      series2.data.setAll(newData[1]);
    }
  };

  useLayoutEffect(() => {
    init();
  }, []);
  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
};
