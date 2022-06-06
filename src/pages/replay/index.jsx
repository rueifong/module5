import React, { useState, useEffect } from "react";
import { defaultAxios, api } from "../../environment/api";
import DisplayChart from "../../component/chart/display-chart";
import Simulator from "../simulator";
import BarLineChart from "../../pages/echart-example/bar-line";
import { Input, Button, Radio, Select } from 'antd';
const { Option } = Select;

const ReplayChart = () => {
  const [interestRate, setInterestRate] = useState(5);
  const [volatility, setVolatility] = useState(30);
  const [data, setData] = useState({
    xAxis: [],
    yAxis: [],
  });
  const [isSet, setIsSet] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isStockPanel, setIsStockPanel] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(-1);
  const [X, setX] = useState([]);
  const [Y, setY] = useState([]);
  const [t, setT] = useState([]);
  const [buttonText, setButtonText] = useState('START');
  const [type, setType] = useState(1);
  const [it, setIt] = useState(0);
  let [timer, setTimer] = useState(null);
  const [longShort, setLongShort] = useState(1);
  const [volume, setVolume] = useState(1);
  const [strike, setStrike] = useState(100);
  const [maturity, setMaturity] = useState(1);
  const [cashFlow, setCashFlow] = useState(0);
  const [Cash, setCash] = useState([]);
  
  const nt = 1001;
  let t_now = [];
  let S = [];
  let xAxis = [];
  // let timer;

  // Reset 按鈕按下
  const ResetButtonPushed = () => {
    stopTimer();
    setIsSet(false);
    setIsStart(false);
    setCurrentStatus(-1);
    setButtonText('START');
    setData({});
  }

  // Start 按鈕按下
  const StartButtonPushed = () => {
    let newY = [];
    let c = it;
    switch (currentStatus) {
      // START
      case 0:
        setIsStockPanel(false);
        startTimer(c, newY);
        // runPlot();
        break;

      // PAUSE
      case 1:
        stopTimer();
        setIsStart(false);
        setCurrentStatus(2);
        setButtonText('CONTINUE');
        setIsStart(true);
        setIsStockPanel(true);
        initialOrderPanel();
        break;

      // CONTINUE
      case 2:
        setIsStockPanel(false);
        newY = data.yAxis;
        startTimer(c, newY);
        break;
    }
  }

  // Start Timer
  const startTimer = (c, newY) => {
    setTimer(setInterval(() => {
      if (c >= X.length) {
        setCurrentStatus(3);
        stopTimer();
        setIsStart(false);
        alert('done');
      } else if (isStart) {
        newY.push(Y[c]);
        setIt(c);
        setData({
          xAxis: X,
          yAxis: newY,
        });
        c++;
        console.log(c, it, X.length);
      } else {
        stopTimer();
      }
      setCurrentStatus(1);
      setButtonText('PAUSE');
    }, 3));
  }

  // Stop Timer
  const stopTimer = () => {
    clearInterval(timer);
    setTimer(null);
  }

  // useEffect(() => {
    // startTimer(count, []);
    // let intervalId = setInterval(startTimer,1000)
  // }, [isSet, isStart])

  // Long 及 Short 選擇改變 
  const LongShortSelectionChanged = (e) => {
    setLongShort(e.target.value);
    updateOrderPanel(type);
  };
  
  // 商品型態選擇改變
  const TypeSelectionChanged = (currentType) => {
    setType(currentType);
    updateOrderPanel(currentType);
  }

  // Volume 數值改變
  const VolumeValueChanged = (e) => {
    setVolume(e.target.value);
    updateOrderPanel(type);
  }

  // Strike 數值改變
  const StrikeValueChanged = (e) => {
    setStrike(e.target.value);
    updateOrderPanel(type);
  }

  // Maturity 數值改變
  const MaturityValueChanged = (value) => {
    setMaturity(value);
    updateOrderPanel(type);
  };

  // Place Order 按鈕按下
  const PlaceOrderPushed =  () => {
    let nPortfolio = nPortfolio + 1
    // 宣告 tableData[] 表示第 nPortfolio 筆下單資訊表 (共 10 個欄位)
    let i = nPortfolio;
    let tableData = [];
    tableData[1] = i;
    tableData[2] = X[it];
    tableData[3] = type;

    let expireIt = [];
    let expireInd;
    let T; 
    if (type == 1) {
      expireIt[i] = nt;
    } else {
      T = maturity;
      tableData[4] = T;
      expireInd = Math.round(1000 * T + 1);
      expireIt[i]= expireInd;
      let K = strike;
      tableData[5] = K;
    }
    let vol = volume
    tableData[6] = vol * longShort;
    let cost = [];
    cost[i] = -cashFlow;
    tableData[7] = -cashFlow;
    tableData[8] = -cashFlow;
    tableData[9] = 0;
    // 將 tableData 資料填入 portfolioTable 第 i 列
    let r = interestRate / 100;
    let dt = 1 / (nt - 1);
    let tt = [];
    for (let j = 0; j <= (nt - it); j++) {
      tt[j + 1] = j * dt;
    }
    let cash = [];
    for (let j = it; j <= nt; j++) {
      cash[j] = cash[j] + cashFlow * Math.exp(r * tt[j - it + 1]);
    }
    let portfolioProfit = [];
    if (type == 1) {
      setCashFlow(longShort * Y[nt] * vol);
      cash[nt] = cash[nt] + cashFlow;
      portfolioProfit[i][nt] = cashFlow - cost[i]
    } else {
      for (let j = 0; j <= (nt - expireInd); j++) {
        tt[j + 1] = j * dt;
      }
      switch (type) {
        case 2:
          setCashFlow(longShort * (Y[expireInd] - K) * vol);
          break;
        case 3:
          setCashFlow(longShort * Math.max(Y[expireInd] - K, 0) * vol);
          break;
        case 4:
          setCashFlow(longShort * Math.max(K - Y[expireInd], 0) * vol);
          break;
        case 5:
          setCashFlow(longShort * (Y[expireInd] > K) * vol);
          break;
        case 6:
          setCashFlow(longShort * (K > Y[expireInd]) * vol);
          break;
      }
      for (let j = expireInd; j <= nt; j++) {
        cash[j] = cash[j] + cashFlow * Math.exp(r * tt[j - expireInd + 1]);
        portfolioProfit[i][j] = cashFlow - cost[i];
      }
    }

    let marketPrice = [];
    if (type == 1) {
      for (let j = it; j <= (nt - 1); j++) {
        marketPrice[i][j] = longShort * Y[j] * vol;
        portfolioProfit[i][j] = marketPrice[i][j] - cost[i];
      }
    } else {
      for (let j = 0; j <= (expireInd - 1 - it); j++) {
        tau[j + 1] = T - j * dt;
      }
      for (let j = it; j <= (expireInd - 1); j++) {
        ind[j - it + 1] = j;
      }
      v = volatility / 100;

      switch (type) {
        case 2:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = Y[ind[j]] - K * Math.exp(-r * tau[j]);
          }
          break;
        case 3:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = vanillaPrice(Y[ind[j]], K, r, v, tau[j], 1);
          }
          break;
        case 4:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = vanillaPrice(Y[ind[j]], K, r, v, tau[j], -1);
          }
          break;
        case 5:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = binaryPrice(Y[ind[j]], K, r, v, tau[j], 1);
          }
          break;
        case 6:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = binaryPrice(Y[ind[j]], K, r, v, tau[j], -1);
          }
          break;
      }
      for (let j = it; j <= (expireInd - 1); j++) {
        marketPrice[i][j] = longShort * price[j - it + 1] * vol;
        portfolioProfit[i][j] = marketPrice[i][j] - cost[i];
      }
    }
    for (let j = 1; j <= nt; j++) {
      for (let k = 1; k <= nPortfolio; k++) {
        profit[j] = profit[j] + marketPrice[k, j] + cash[j];
      }
    }
    setCash(cash[it]);
  }

  // 下單面板初始化設定
  const initialOrderPanel = () => {
    setIsStockPanel(true);
    setType(1);
    setLongShort(1);
    setVolume(1);
    setStrike(100);
    setMaturity(1);
    setCashFlow(-Y[it]);
    updateOrderPanel(type);
  }

  // 下單面板更新
  const updateOrderPanel = (typeNow) => {
    // LongShortFlag = (Long: 1; Short: -1)
    let S0 = Y[it];
    let K = strike;
    let r = interestRate / 100;
    let v = volatility / 100;
    let T = maturity;
    let tau = T - t[it];
    let vol = volume;
    let price = 0;

    switch(typeNow) {
      case 1:
        price = S0;
        break;
      case 2:
        setStrike(Math.round(S0 * Math.exp(r * tau), 2));
        price = 0;
        break;
      case 3: case 4:
        price = vanillaPrice(S0, K, r, v, tau, 7 - 2 * typeNow);
        break;
      case 5: case 6:
        price = binaryPrice(S0, K, r, v, tau, 11 - 2 * typeNow);
        break;
    }
    setCashFlow(-longShort * price * vol);
  }

  // 產生股價
  const generateGBM = () => {
    let r = interestRate / 100;
    let v = volatility / 100;
    for (let j = 0; j < nt; j++) {
      t_now[j] = (j) / (nt - 1);
      xAxis[j] = j;
    }
    setT(t_now);

    let dt = 1 / (nt - 1);
    S[0] = 100

    let total = 0;
    let dataR = [];
    for (let j = 1; j < nt; j++) {
      let U1 = Math.random();
      let U2 = Math.random();
      let Z =  Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * U2 * Math.PI);
      let R = (r - 0.5 * Math.pow(v, 2)) * dt + v * Math.sqrt(dt) * Z;
      S[j] = S[j - 1] * Math.exp(R);

      // dataR[j] = R;
      total += R;
    }


    console.log('xAxis', xAxis);
    console.log('total', total / 1000);
    console.log('S', S);
    console.log('t', t);

    setX(t_now);
    setY(S);
    setIsSet(true);
    setIsStart(true);
    setCurrentStatus(0);
    setIsStockPanel(true);
    initialOrderPanel();
  }
  
  // vanilla option 評價公式
  const vanillaPrice = (S0, K, r, v, T, zeta) => {
    let vt = v * Math.sqrt(T);
    let d1 = (Math.log(S0 / K) + (r + 0.5 * Math.pow(v, 2)) * T) / vt;
    let d2 = d1 - vt;
    let Nd1 = N(d1);
    let Nd2 = N(d2);
    let price = zeta * (S0 * Nd1 - K * Math.exp(-r * T) * Nd2);
    return price;
  }

  // binary option 評價公式
  const binaryPrice = (S0, K, r, v, T, zeta) => {
    let vt = v * Math.sqrt(T);
    let d = (Math.log(S0 / K) + (r - 0.5 * Math.pow(v, 2)) * T) / vt;
    let Nd = N(d);
    let price = Math.exp(-r * T) * Nd;
    return price;
  }

  // Normal CDF
  const N = (z) => {
    let b1 = 0.31938153;
    let b2 = -0.356563782;
    let b3 = 1.781477937;
    let b4 = -1.821255978;
    let b5 = 1.330274429;
    let p = 0.2316419;
    let c2 = 0.3989423;
    let a = Math.abs(z);
    if (a > 6.0) {return 1.0;}
    let t = 1.0 / (1.0 + a * p);
    let b = c2 * Math.exp((-z) * (z / 2.0));
    let n = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
    n = 1.0 - b * n;
    if (z < 0.0) {n = 1.0 - n;}
    return n;
  }

  return (
    <div className="flex">

      {/* 設定 */}
      <div className="w-1/4">
        <div className="border p-5">
          <h6>Stock Properties</h6>
          <div className="flex items-center mb-2">
            <span className="w-2/3">Interest rate (%)</span>
            <Input disabled={isSet} type="number" className="w-30" value="5.00" />
          </div>
          <div className="flex items-center mb-2">
            <span className="w-2/3">Volatility (%)</span>
            <Input disabled={isSet} type="number" className="w-30" value="30" />
          </div>
          <Button disabled={isSet} onClick={() => generateGBM()} className="w-full">Set</Button>
        </div>

        <div className="flex p-5">
          <Button disabled={!isSet} onClick={() => ResetButtonPushed()} className="w-1/2" type="danger">Reset</Button>
          <Button disabled={!isSet || currentStatus == 3} onClick={() => StartButtonPushed()} className="w-1/2" type="primary">{buttonText}</Button>
        </div>

        <div className="border p-5">
          <h6>Place Order</h6>
          <Radio.Group disabled={!isStockPanel} className="mb-2" onChange={LongShortSelectionChanged} value={longShort}>
            <Radio value={1}>Long</Radio>
            <Radio value={-1}>Short</Radio>
          </Radio.Group>
          <Button disabled={!isStockPanel} type={type == 1 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(1)} className="w-full mb-2">Stock</Button>
          <Button disabled={!isStockPanel} type={type == 2 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(2)} className="w-full mb-2">Futures</Button>
          <div className="flex mb-2">
            <Button disabled={!isStockPanel} type={type == 3 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(3)} className="w-1/2">Vanilla Call</Button>
            <Button disabled={!isStockPanel} type={type == 4 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(4)} className="w-1/2">Vanilla Put</Button>
          </div>
          <div className="flex mb-2">
            <Button disabled={!isStockPanel} type={type == 5 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(5)} className="w-1/2">Binary Call</Button>
            <Button disabled={!isStockPanel} type={type == 6 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(6)} className="w-1/2">Binary Put</Button>
          </div>
          <div className="flex items-center">
            <span className="w-1/3">Volume</span>
            <Input disabled={!isStockPanel} type="number" className="w-2/3" value={volume} onChange={VolumeValueChanged} />
          </div>
          <div className="flex items-center" style={{ opacity: (type == 1) ? 0 : 1 }}>
            <span className="w-1/3">Strike</span>
            <Input disabled={type == 1 || type == 2 || !isStockPanel} type="number" className="w-2/3" value={strike} onChange={StrikeValueChanged} />
          </div>
          <div className="flex items-center" style={{ opacity: (type == 1) ? 0 : 1 }}>
            <span className="w-1/3">Maturity</span>
            <Select disabled={type == 1 || !isStockPanel} className="w-2/3" defaultValue="1" onChange={MaturityValueChanged}>
              <Option disabled={X[it] >= 0.2} value="0.2">0.2</Option>
              <Option disabled={X[it] >= 0.4} value="0.4">0.4</Option>
              <Option disabled={X[it] >= 0.6} value="0.6">0.6</Option>
              <Option disabled={X[it] >= 0.8} value="0.8">0.8</Option>
              <Option value="1">1</Option>
            </Select>
          </div>
          <div className="flex items-center">
            <span className="w-1/3">Cash Flow</span>
            <Input disabled="true" type="number" className="w-2/3" value={cashFlow} />
          </div>
          <Button disabled={!isStockPanel} className="w-full mt-3" type="primary" onClick={() => PlaceOrderPushed()}>Place Order</Button>
        </div>
      </div>

      {/* 圖表 */}
      <div className="w-3/4">
        <BarLineChart
          data={data}
        />
      </div>
    </div>
  );
};

export default ReplayChart;
