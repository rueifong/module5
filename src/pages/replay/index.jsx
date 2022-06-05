import React, { useState, useMemo } from "react";
import { defaultAxios, api } from "../../environment/api";
import DisplayChart from "../../component/chart/display-chart";
import Simulator from "../simulator";
import BarLineChart from "../../pages/echart-example/bar-line";
import { Input, Button, Radio, Select } from 'antd';
const { Option } = Select;

const ReplayChart = () => {
  const [interestRate, setInterestRate] = useState(5);
  const [volatility, setVolatility] = useState(30);
  const [data, setData] = useState({});
  const [isSet, setIsSet] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(-1);
  const [X, setX] = useState([]);
  const [Y, setY] = useState([]);
  const [t, setT] = useState([]);
  const [buttonText, setButtonText] = useState('START');
  const [type, setType] = useState(1);
  let [count, setCount] = useState(0);
  let [timer, setTimer] = useState(null);
  const [longShort, setLongShort] = useState(1);
  const [volume, setVolume] = useState(1);
  const [strike, setStrike] = useState(100);
  const [maturity, setMaturity] = useState(1);  
  const [cashFlow, setCashFlow] = useState(0);  
  

  const nt = 1001;
  let t_now = [];
  let S = [];
  let xAxis = [];

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
  }

  // 重設
  const ResetButtonPushed = () => {
    setIsSet(false);
    setIsStart(false);
    setCurrentStatus(-1);
    setTimer(null);
    clearInterval(timer);
    setButtonText('START');
    setData({});
  }

  const StartButtonPushed = () => {
    let newY = [];
    let c = count;
    switch (currentStatus) {
      // START
      case 0:
        setTimer(setInterval(() => {
          if (isStart) {
            newY.push(Y[c]);
            setCount(c);
            setData({
              xAxis: X,
              yAxis: newY,
            });
            c++;
          } else if (c == X.length) {
            clearInterval(timer);
            setCurrentStatus(3);
          } else {
            clearInterval(timer);
          }
          setCurrentStatus(1);
          setButtonText('PAUSE');
        }, 3));
        break;
      // PAUSE
      case 1:
        setIsStart(false);
        setTimer(null);
        clearInterval(timer);
        setCurrentStatus(2);
        setButtonText('CONTINUE');
        setIsStart(true);
        break;

      // CONTINUE
      case 2:
        newY = data.yAxis;
        setTimer(setInterval(() => {
          if (isStart) {
            newY.push(Y[c]);
            setCount(c);
            setData({
              xAxis: X,
              yAxis: newY,
            });
            c++;
          } else if (c == X.length) {
            clearInterval(timer);
            setCurrentStatus(3);
          } else {
            clearInterval(timer);
          }
          setCurrentStatus(1);
          setButtonText('PAUSE');
        }, 3));
        break;
    }
  }

  // Long Short Change
  const onChange = (e) => {
    setLongShort(e.target.value);
    updateOrderPanel(type);
  };
  
  // 商品型態選擇改變
  const TypeSelectionChanged = (currentType) => {
    setType(currentType);
    updateOrderPanel(currentType);
  }

  // Maturity Change
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    updateOrderPanel(type);
  };

  // 下單面板初始化設定
  const initialOrderPanel = () => {
    setType(1);
    setLongShort(1);
    setVolume(1);
    setStrike(100);
    setMaturity(1);
  }

  // 下單面板更新
  const updateOrderPanel = (typeNow) => {
    // LongShortFlag = (Long: 1; Short: -1)
    let S0 = Y[count];
    let K = strike;
    let r = interestRate / 100;
    let v = volatility / 100;
    let T = maturity;
    let tau = T - t[count];
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
  // vanilla option 評價公式
  const vanillaPrice = (S0, K, r, v, T, zeta) => {
    let vt = v * Math.sqrt(T);
    let d1 = (Math.log(S0 / K) + (r + 0.5 * Math.pow(v, 2)) * T) / vt;
    let d2 = d1 - vt;
    let Nd1 = N(d1);
    let Nd2 = N(d2);
    let price = zeta * (S0 * Nd1 - K * Math.exp(-r * T) * Nd2);
    console.log('zete', zeta);
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
      <div className="w-1/3">
        <div className="border p-5">
          <h6>Stock Properties</h6>
          <div className="flex items-center">
            <span className="w-2/3">Interest rate (%)</span>
            <Input disabled={isSet} type="number" className="w-30" value="5.00" />
          </div>
          <div className="flex items-center">
            <span className="w-2/3">Volatility (%)</span>
            <Input disabled={isSet} type="number" className="w-30" value="30" />
          </div>
          <Button disabled={isSet} onClick={() => generateGBM()}>Set</Button>
        </div>

        <div className="flex p-5">
          <Button disabled={!isSet} onClick={() => ResetButtonPushed()} className="w-1/2" type="danger">Reset</Button>
          <Button disabled={!isSet || currentStatus == 3} onClick={() => StartButtonPushed()} className="w-1/2" type="primary">{buttonText}</Button>
        </div>

        <div className="border p-5">
          <h6>Place Order</h6>
          <Radio.Group className="mb-2" onChange={onChange} value={longShort}>
            <Radio value={1}>Long</Radio>
            <Radio value={-1}>Short</Radio>
          </Radio.Group>
          <Button type={type == 1 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(1)} className="w-full mb-2">Stock</Button>
          <Button type={type == 2 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(2)} className="w-full mb-2">Futures</Button>
          <div className="flex mb-2">
            <Button type={type == 3 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(3)} className="w-1/2">Vanilla Call</Button>
            <Button type={type == 4 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(4)} className="w-1/2">Vanilla Put</Button>
          </div>
          <div className="flex mb-2">
            <Button type={type == 5 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(5)} className="w-1/2">Binary Call</Button>
            <Button type={type == 6 ? 'primary' : 'default'} onClick={() => TypeSelectionChanged(6)} className="w-1/2">Binary Put</Button>
          </div>
          <div className="flex items-center">
            <span className="w-1/3">Volume</span>
            <Input type="number" className="w-2/3" value="5.00" />
          </div>
          <div className="flex items-center" style={{ opacity: (type == 1) ? 0 : 1 }}>
            <span className="w-1/3">Strike</span>
            <Input disabled={type == 1 || type == 2} type="number" className="w-2/3" value="30" />
          </div>
          <div className="flex items-center" style={{ opacity: (type == 1) ? 0 : 1 }}>
            <span className="w-1/3">Maturity</span>
            <Select disabled={type == 1} className="w-2/3" defaultValue="1" onChange={handleChange}>
              <Option value="0.2">0.2</Option>
              <Option value="0.4">0.4</Option>
              <Option value="0.6">0.6</Option>
              <Option value="0.8">0.8</Option>
              <Option value="1">1</Option>
            </Select>
          </div>
          <div className="flex items-center">
            <span className="w-1/3">Cash Flow</span>
            <Input disabled="true" type="number" className="w-2/3" value={cashFlow} />
          </div>
          <Button className="w-full mt-3" type="primary">Place Order</Button>
        </div>
      </div>

      {/* 圖表 */}
      <div className="w-2/3">
      {/* {useMemo(() => { */}
        <BarLineChart
          data={data}
          // onDateFormatChange={(v) => {
          //   onDateFormatChange && onDateFormatChange(v);
          // }}
        />
      {/* }, [S])} */}
      </div>

      {/* <DisplayChart
        isResetChart={isResetChart}
        setIsResetChart={setIsResetChart}
        stock={replayStockId ? { id: replayStockId } : {}}
      /> */}
      {/* <Simulator
        onReset={() => {
          setIsResetChart(true);
        }}
        customResetStock={async (stockId) => {
          const { url, method } = api.resetStock;
          return await defaultAxios({
            url,
            method,
            data: { id: stockId, isReset: false },
          }).then(({ data }) => {
            setReplayStockId(data.display.stockId);
            return data.display.stockId;
          });
        }}
      /> */}
    </div>
  );
};

export default ReplayChart;
