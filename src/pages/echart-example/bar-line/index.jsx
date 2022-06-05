import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";

const BarLineChart = ({
  data = { xAxis: [], yAxis: [] },
}) => {
  console.log('data', data);
  const [dataZoom, setDataZoom] = useState(10);
  const [dateFormat, setDateFormat] = useState(4);
  const options = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#283b56",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      containLabel: true,
    },
    legend: {
      data: ["成交量"],
    },
    // backgroundColor: "black",
    xAxis: [
      {
        type: "category",
        // boundaryGap: true,
        data: data.xAxis,
        axisLabel: {
          formatter: (value, index) => {
            return value;
          },
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        // scale: true,
        // name: "成交價",
      },
    ],
    // dataZoom: [
    //   {
    //     show: true,
    //     realtime: true,
    //     startValue: dataZoom ? data.xAxis.length - dataZoom : 0,
    //     endValue: data.xAxis.length - 1,
    //     onChange: (val) => {
    //       console.log(val);
    //     },
    //   },
    // ],
    series: [
      {
        name: "成交價",
        type: "line",
        // step: "end",
        data: data.yAxis,
        // itemStyle: {
        //   color: "black",
        // },
      },
    ],
  };

  return (
    <>
      <ReactECharts className="border" option={options} />
    </>
  );
};

export default BarLineChart;
