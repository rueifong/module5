import React, { useState, useEffect } from "react";
import { defaultAxios, api } from "../../environment/api";
import DisplayChart from "../../component/chart/display-chart";
import Simulator from "../simulator";
import BarLineChart from "../../pages/echart-example/bar-line";
import { Input, Button, Radio, Select, Table } from 'antd';
const { Option } = Select;

const ReplayChart = () => {
  let [timer, setTimer] = useState(null);
  const [StockPriceChart, setStockPriceChart] = useState({
    xAxis: [],
    yAxis: [],
    max: 150,
    min: 0,
  });
  const [ProfitChart, setProfitChart] = useState({
    xAxis: [],
    yAxis: [],
    max: 100,
    min: -100,
  });
  let [tableData, setTableData] = useState([]);
  const [isSet, setIsSet] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isStockPanel, setIsStockPanel] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(-1);
  const [X, setX] = useState([]);
  const [Y, setY] = useState([]);
  const [PY, setPY] = useState([]);
  const [t, setT] = useState([]);
  let [S, setS] = useState([]);
  let [it, setIt] = useState(1);
  const [buttonText, setButtonText] = useState('START');
  const [interestRate, setInterestRate] = useState(5);
  const [volatility, setVolatility] = useState(30);
  const [type, setType] = useState(1);
  const [longShort, setLongShort] = useState(1);
  const [volume, setVolume] = useState(1);
  const [strike, setStrike] = useState(100);
  const [maturity, setMaturity] = useState(1);
  let [cashFlow, setCashFlow] = useState(0);
  let [nPortfolio, setNPortfolio] = useState(0);
  let [expireIt, setExpireIt] = useState([]);
  let [marketPrice, setMarketPrice] = useState([]);
  let [portfolioProfit, setPortfolioProfit] = useState([]);
  let [cash, setcash] = useState([]);
  let [Cash, setCash] = useState(0);
  let [profit, setprofit] = useState([]);
  let [Profit, setProfit] = useState(0);
  let [Time, setTime] = useState(0);
  let [cost, setCost] = useState([]);
  const [nt] = useState(1001);

  // const nt = 1001;
  let t_now = [];
  // let S = [];
  // let timer;

  // Reset 按鈕按下
  const ResetButtonPushed = () => {
    stopTimer();
    setIsSet(false);
    setIsStart(false);
    setCurrentStatus(-1);
    setButtonText('START');
    setStockPriceChart({
      title: 'Stock Price',
      xAxis: [],
      yAxis: [],
      max: 150,
      min: 0,  
    });
    setProfitChart({
      title: 'Profit',
      xAxis: [],
      yAxis: [],
      max: 100,
      min: -100,
    });
    setTableData([]);
  }

  // Start 按鈕按下
  const StartButtonPushed = () => {
    let newY = [];
    let newPY = [];
    let c = it;
    switch (currentStatus) {
      // START
      case 0:
        setIsStockPanel(false);
        startTimer(c, newY, newPY);
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
        newY = StockPriceChart.yAxis;
        newPY = ProfitChart.yAxis;
        console.log('newY', profit.length, PY.length);
        startTimer(c, newY, newPY);
        break;
    }
  }

  // Start Timer
  const startTimer = (c, newY, newPY) => {
    setTimer(setInterval(() => {
      if (c >= X.length) {
        setCurrentStatus(3);
        stopTimer();
        setIsStart(false);
        alert('done');
      } else if (isStart) {
        newY.push(Y[c]);
        newPY.push(PY[c]);
        setIt(c);
        it = c;
        setStockPriceChart({
          title: 'Stock Price',
          xAxis: X,
          yAxis: newY,
          max: 150,
          min: 0,
        });
        setProfitChart({
          title: 'Profit',
          xAxis: X,
          yAxis: newPY,
          max: 100,
          min: -100,
        });
        updatePortfolioTable();
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

  const InterestRateValueChanged = (e) => {
    setInterestRate(e.target.value);
  }

  const VolatilityValueChanged = (e) => {
    setVolatility(e.target.value);
  }

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
    // 宣告 tableData[] 表示第 nPortfolio 筆下單資訊表 (共 10 個欄位)
    let i = nPortfolio + 1;
    let table = [];
    table[1] = i;
    setNPortfolio(i);
    nPortfolio = i;
    table[2] = t[it];
    let typeArray = [0, 'Stock', 'Futures', 'Vanilla Call', 'Vanilla Put' ,'Binary Call', 'Binary Put'];
    table[3] = typeArray[type];

    let expireIt_now = expireIt;
    let expireInd;
    let T;
    let K;
    let CashFlow = cashFlow;
    let cash_now = cash;
    let portfolio = portfolioProfit;
    let market = marketPrice;
    let tau = [];
    let ind = [];
    let v;
    let price;
    if (type == 1) {
      expireIt_now[i] = nt;
    } else {
      T = maturity;
      table[4] = T;
      expireInd = Math.round(1000 * T + 1);
      expireIt_now[i]= expireInd;
      K = strike;
      table[5] = K;
    }
    setExpireIt(expireIt_now);
    expireIt = expireIt_now;
    let vol = volume;
    let profit_now = profit;
    let cost_now = cost;
    table[6] = vol * longShort;
    cost_now[i] = -CashFlow;
    setCost(cost_now);
    cost = cost_now;
    table[7] = -CashFlow;
    table[8] = -CashFlow;
    table[9] = 0;
    // 將 tableData 資料填入 portfolioTable 第 i 列
    setTableData(t => [...t, {
      id: table[1],
      time: table[2],
      type: table[3],
      t: table[4],
      k: table[5],
      vol: table[6],
      cost: table[7],
      marketValue: table[8],
      profit: table[9],
      expire: table[10],
    }]);
    let r = interestRate / 100;
    let dt = 1 / (nt - 1);
    let tt = [];
    for (let j = 0; j <= (nt - it); j++) {
      tt[j + 1] = j * dt;
    }
    for (let j = it; j <= nt; j++) {
      cash_now[j] = cash_now[j] + CashFlow * Math.exp(r * tt[j - it + 1]);
    }
    portfolio[i] = [];
    if (type == 1) {
      CashFlow = (longShort * S[nt] * vol);
      cash_now[nt] = cash_now[nt] + CashFlow;
      portfolio[i][nt] = CashFlow - cost_now[i]
    } else {
      for (let j = 0; j <= (nt - expireInd); j++) {
        tt[j + 1] = j * dt;
      }
      switch (type) {
        case 2:
          CashFlow = (longShort * (S[expireInd] - K) * vol);
          break;
        case 3:
          CashFlow = (longShort * Math.max(S[expireInd] - K, 0) * vol);
          break;
        case 4:
          CashFlow = (longShort * Math.max(K - S[expireInd], 0) * vol);
          break;
        case 5:
          CashFlow = (longShort * (S[expireInd] > K) * vol);
          break;
        case 6:
          CashFlow = (longShort * (K > S[expireInd]) * vol);
          break;
      }
      for (let j = expireInd; j <= nt; j++) {
        cash_now[j] = cash_now[j] + CashFlow * Math.exp(r * tt[j - expireInd + 1]);        
        portfolio[i][j] = CashFlow - cost_now[i];
      }
    }

    market[i] = [];
    if (type == 1) {
      for (let j = it; j <= (nt - 1); j++) {
        market[i][j] = longShort * S[j] * vol;
        portfolio[i][j] = market[i][j] - cost_now[i];
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
            price = S[ind[j]] - K * Math.exp(-r * tau[j]);
          }
          break;
        case 3:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = vanillaPrice(S[ind[j]], K, r, v, tau[j], 1);
          }
          break;
        case 4:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = vanillaPrice(S[ind[j]], K, r, v, tau[j], -1);
          }
          break;
        case 5:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = binaryPrice(S[ind[j]], K, r, v, tau[j], 1);
          }
          break;
        case 6:
          for (let j = 1; j <= (expireInd - it); j++) {
            price = binaryPrice(S[ind[j]], K, r, v, tau[j], -1);
          }
          break;
      }
      for (let j = it; j <= (expireInd - 1); j++) {
        market[i][j] = longShort * price[j - it + 1] * vol;
        portfolio[i][j] = market[i][j] - cost_now[i];
      }
    }
    setMarketPrice(market);
    marketPrice = market;
    for (let j = 1; j <= nt; j++) {
      for (let k = 1; k <= nPortfolio; k++) {
        profit_now[j] = profit_now[j] + marketPrice[k][j] + cash_now[j];
      }
    }
    setPortfolioProfit(portfolio);
    portfolioProfit = portfolio;
    setprofit(profit_now);
    profit = profit_now;
    setCashFlow(CashFlow);
    cashFlow = CashFlow;
    setcash(cash_now);
    cash = cash_now;
    setCash(cash_now[it]);
    Cash = cash_now[it];
    setPY(profit_now.slice(1));
    console.log('profit_now', profit_now);
    console.log('cash_now', cash_now);
  }

  // 下單面板初始化設定
  const initialOrderPanel = () => {
    setIsStockPanel(true);
    setType(1);
    setLongShort(1);
    setVolume(1);
    setStrike(100);
    setMaturity(1);
    setCashFlow(-S[it]);
    cashFlow = -S[it];
    updateOrderPanel(type);
  }

  // 下單面板更新
  const updateOrderPanel = (typeNow) => {
    // LongShortFlag = (Long: 1; Short: -1)
    let S0 = S[it];
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
    cashFlow = -longShort * price * vol;
  }

  // 更新 Portfolio Table
  const updatePortfolioTable = () => {
    setCash(cash[it]);
    Cash = cash[it];
    setProfit(profit[it]);
    Profit = profit[it];
    setTime(t[it]);
    Time = t[it];
    let portfolioTable = tableData;
    console.log('portfolioTable', portfolioTable);
    console.log('nPortfolio', nPortfolio);
    if (nPortfolio > 0) {
      for (let i = 1; i <= nPortfolio; i++) {
        // console.log('portfolioTable2', i, portfolioTable[i].marketValue, marketPrice);
        portfolioTable[i-1].marketValue = marketPrice[i][it];
        portfolioTable[i-1].profit = portfolioProfit[i][it];
        // if (expireIt[i] < it) {
        //   portfolioTable[i].expire = 'X';
        // }
      }
    }
    setTableData(portfolioTable);
    tableData = portfolioTable;
  }

  // 產生股價
  const generateGBM = () => {
    let r = interestRate / 100;
    let v = volatility / 100;
    let py = [];
    for (let j = 1; j <= nt; j++) {
      t_now[j] = (j - 1) / (nt - 1);
      py[j] = 0;
    }

    let dt = 1 / (nt - 1);
    let s = [];
    s[0] = 0;
    s[1] = 100
    for (let j = 2; j <= nt; j++) {
      let U1 = Math.random();
      let U2 = Math.random();
      let Z =  Math.sqrt(-2 * Math.log(U1)) * Math.cos(2 * U2 * Math.PI);
      let R = (r - 0.5 * Math.pow(v, 2)) * dt + v * Math.sqrt(dt) * Z;
      s[j] = s[j - 1] * Math.exp(R);
    }
    console.log('S', s);
    console.log('t', t);

    setX(t_now.slice(1));
    setY(s.slice(1));
    setPY(py.slice(1));
    setcash(py);
    cash = py;
    setprofit(py);
    profit = py;
    setT(t_now);
    setS(s);
    S = s;
    setIsSet(true);
    setIsStart(true);
    setCurrentStatus(0);
    setIsStockPanel(true);

    console.log('GBM', S, s, it);

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
    <>
      <div style={{ backgroundColor: '#628ea5', padding: '0.5rem' }}>
        <h1 className="text-center mb-0" style={{ fontFamily: 'Microsoft Yahei', fontWeight: 500, fontSize: '1.5rem', color: '#fff' }}>
        模組五 選擇權交易策略模組
        </h1>
        <p className="text-center mb-0" style={{ fontFamily: 'Microsoft Yahei', fontSize: '2.4vmin', color: '#fff' }}>TaiwanTech Derivatives Lab</p>
      </div>
      <div className="flex">
        {/* 設定 */}
        <div className="w-1/5">
          <div className="border p-5">
            <h6>Stock Properties</h6>
            <div className="flex items-center mb-2">
              <span className="w-2/3">Interest rate (%)</span>
              <Input disabled={isSet} type="number" className="w-30" value={interestRate} onChange={InterestRateValueChanged} />
            </div>
            <div className="flex items-center mb-2">
              <span className="w-2/3">Volatility (%)</span>
              <Input disabled={isSet} type="number" className="w-30" value={volatility} onChange={VolatilityValueChanged} />
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
                <Option disabled={t[it] >= 0.2} value="0.2">0.2</Option>
                <Option disabled={t[it] >= 0.4} value="0.4">0.4</Option>
                <Option disabled={t[it] >= 0.6} value="0.6">0.6</Option>
                <Option disabled={t[it] >= 0.8} value="0.8">0.8</Option>
                <Option value="1">1</Option>
              </Select>
            </div>
            <div className="flex items-center">
              <span className="w-1/3">Cash Flow</span>
              <Input disabled={true} type="number" className="w-2/3" value={cashFlow} />
            </div>
            <Button disabled={!isStockPanel} className="w-full mt-3" type="primary" onClick={() => PlaceOrderPushed()}>Place Order</Button>
          </div>
        </div>

        {/* 圖表 */}
        <div className="w-4/5">
          <BarLineChart
            data={StockPriceChart}
          />
          <BarLineChart
            data={ProfitChart}
          />

          <div className="flex">
            <div className="w-3/4">
              <Table
                className="border"
                rowKey="id"
                size="small"
                columns={[
                  {
                    title: "ID",
                    dataIndex: "id",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "Time",
                    dataIndex: "time",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "Type",
                    dataIndex: "type",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "T",
                    dataIndex: "t",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "K",
                    dataIndex: "k",
                    key: Math.random(),
                    width: 50,
                  },              {
                    title: "Vol.",
                    dataIndex: "vol",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "Cost",
                    dataIndex: "cost",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "MarketValue",
                    dataIndex: "marketValue",
                    key: Math.random(),
                    width: 80,
                  },
                  {
                    title: "Profit",
                    dataIndex: "profit",
                    key: Math.random(),
                    width: 50,
                  },
                  {
                    title: "Expire",
                    dataIndex: "expire",
                    key: Math.random(),
                    width: 50,
                  },
                ]}
                pagination={false}
                dataSource={
                  tableData
                  // orders.length && [{ ...orders[currentIndex], key: Math.random() }]
                }
                sticky
              />
            </div>
            <div className="w-1/4 p-5 border py-8">
              <div className="flex items-center mb-2">
                <span className="w-1/3">Cash</span>
                <Input disabled={true} type="number" className="w-2/3" value={Cash} />
              </div>
              <div className="flex items-center mb-2">
                <span className="w-1/3">Profit</span>
                <Input disabled={true} type="number" className="w-2/3" value={Profit} />
              </div>
              <div className="flex items-center">
                <span className="w-1/3">Time</span>
                <Input disabled={true} type="number" className="w-2/3" value={Time} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReplayChart;
