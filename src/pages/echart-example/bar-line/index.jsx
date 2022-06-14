import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";

const BarLineChart = ({
  data = { title: '', xAxis: [], yAxis: [], max: 100, min: 0 },
}) => {
  console.log('data', data);
  const [dataZoom, setDataZoom] = useState(1001);
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
        boundaryGap: true,
        data: data.xAxis,
        axisLabel: {
          interval: 100,
          align: 'center',
          formatter: (value, index) => {
            return Number(value).toFixed(1);
          },
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          interval: 100,
          inside: true,
        }
      },
    ],
    yAxis: [
      {
        type: "value",
        // name: (data.title) ? data.title : 'title',
        // nameLocation: "middle",
        // nameGap: 10,
        
        // scale: true,
        // name: "成交價",
        // max: Math.max(data.max, Math.max(...data.yAxis)) + 10,
        // min: Math.min(data.min, Math.min(...data.yAxis)) - 10,
      },
    ],
    dataZoom: [
      {
        show: true,
        realtime: true,
        startValue: dataZoom ? data.xAxis.length - dataZoom : 0,
        endValue: data.xAxis.length - 1,
        onChange: (val) => {
          console.log(val);
        },
      },
    ],
    series: [
      {
        name: "成交價",
        type: "line",
        data: data.yAxis,
        endLabel: {
          show: true,
          borderColor: 'red',
          borderWidth: '3px',
          width: '3px',
          height: '3px',
          backgroundColor: 'red',
        },
        markPoint: {
          animation: false,
          symbol: 'circle',
          data: [
            { 
              xAxis: (data.yAxis.length > 0) ? data.yAxis.length-1 : 0,
              yAxis: (data.yAxis.length > 0) ? data.yAxis[data.yAxis.length-1] : 0,
              symbolSize: 6,
              itemStyle: {
                opacity: 1,
                color: '#ff4d4f',
              },
            }
          ]
        },
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
