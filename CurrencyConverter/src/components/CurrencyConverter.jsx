import { useEffect, useState } from "react"
import CurrencyDropdown from "./dropdown";
import axios from "axios";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,Filler);



const CurrencyConverter = () => {
  const [currencies, setCurrencies]=useState([])
  const [amount, setAmount] = useState(1)

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [exchangeRate, setExchangeRate]= useState("");

  const [convertedAmount, setConvertedAmount] = useState(null) //converting state
  const[converting, setConverting] = useState(false) // loading state
  const [updatingDate, setUpdatingDate] = useState("") // updating date of the converting





  // available currencies -> https://api.frankfurter.app/currencies
  const fetchCurrencies = async () => {
    try {
      const res = await fetch("https://api.frankfurter.app/currencies");
      const data = await res.json()

      setCurrencies(Object.keys(data));
    } catch (error) {
      console.error("Error Fetching" ,error);
    }
  };
  useEffect(() => {
    fetchCurrencies();
  }, []);
  //-----------------conversion logic --------------------------
  // conversion from... to... -> // https://api.frankfurter.app/latest?amount=1&from=USD&to=EUR
  const convertCurrency = async () => {
    if(!amount)return
    setConverting(true);
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
      const data = await res.json()

      setConvertedAmount(data.rates[toCurrency]+" "+toCurrency);
      setUpdatingDate(data.date);
      setExchangeRate(Object.values(data.rates));
    } catch (error) {
      console.error("Error Fetching" ,error);
    } finally{
      setConverting(false);
    }
  };
  // ---------------------------------historical data--------------------------------------------
  // historical data of a currency https://api.frankfurter.app/year-month-day..year-month-day?from=USD&to=EUR&amount=1

  const [chartData, setChartData] = useState({
     labels: [], // Initialize with empty labels
    datasets: [{ label: '', data: [] }] // Initialize with an empty dataset
  });

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getRecentMonthDates = () => {
    const today = new Date(); // End date is today
    const lastMonth = new Date(today); 
    lastMonth.setMonth(today.getMonth() - 1); // Start date is one month before today

    const startDate = formatDate(lastMonth);  // Format start date
    const endDate = formatDate(today);  // Format end date

    return { startDate, endDate };
  };

  useEffect(()=> {
  const { startDate, endDate } = getRecentMonthDates();  // Get the recent month's dates

    const fetchdata = async () => {
      const {data} = await axios.get(`https://api.frankfurter.app/${startDate}..${endDate}?from=${fromCurrency}&to=${toCurrency}&amount=1`)
      const dates = Object.keys(data.rates)//rates dates
      const datesValues = Object.values(data.rates).map(rate => rate[toCurrency]); //values of the currency in each date 
      setChartData({
        labels: dates,
        datasets: [{
    label: `Evolution of ${fromCurrency}/${toCurrency} over the last month`,
    data: datesValues,
    fill: true,
    borderColor: 'rgb(212, 48, 157)',
    tension: 0.1
  }]

      })
    }
    fetchdata()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[fromCurrency, toCurrency])

  return (
    <div>
      <div  className="bg-blue-300 md:max-w-5xl h-24  px-2 py-4  mx-auto p-4 sm:mx-5 md:mx-20 lg:mx-auto sm:rounded-lg md:rounded-none border-solid lg:border-black border">
        <h1 className="text-2xl">Currency Converter</h1>
        <h2 className="text-sm">Real-time exchange rates</h2>
      </div>
      <div className="border md:max-w-5xl mx-auto md:border-black " >
        <div className="border flex md:mx-5 md:my-4 justify-between sm:flex-col md:flex-row">
          <div className="mx-auto md:mx-4 md:bg-blue-200 md:my-8 w-96 h-80 rounded-xl px-5 py-6">
            <div className="flex justify-between mx-3">
              <div className="inline-block">
                <CurrencyDropdown currencies={currencies} 
                  title="From :" 
                  currency={fromCurrency}
                  setCurrency={setFromCurrency}
                />
            </div>

            <div className="inline-block">
              <CurrencyDropdown 
              currencies = {currencies}
              title="To :" 
              setCurrency={setToCurrency}
              currency={toCurrency}
              />
            </div>
            </div>
          
            <label htmlFor="input" className="block mt- ml-3 mt-14 mb-2 "> Amount :</label>
            <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number" className="block w-80 h-8 rounded-md mx-auto pl-3 sm:bg-blue-200 sm:h-10 md:bg-white"  />


            <button
            onClick={convertCurrency}
            className={`bg-blue-400 mt-7 w-80 h-8 rounded-xl ml-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 hover:bg-purple-200 ${converting ? "animate-pulse" :""}` }
            
            >Convert
            </button>
          </div>
          <div className="mx-auto md:mx-4 bg-blue-200 md:my-8 md:w-5/6 h-auto rounded-xl px-5 py-6 sm:w-auto sm:my-10">
            <h1>Converted Amount:</h1>
            {convertedAmount && (<p className=" text-xl font-bold text-blue-600">{convertedAmount}</p>)}
            <h1 className="text-blue-700 font-bold">Exchange Rate:1 {fromCurrency} = {(exchangeRate/amount).toFixed(4)} {toCurrency}</h1>
            <p>Last Update : <span>{updatingDate}</span></p>
            <div>
              <h1>Historical Trend (<span className="font-bold">Last month </span>)</h1>
              <div className="h-auto w-auto ">
                <Line 
                data={chartData}
                options={{
                  responsive: true,
                  plugins:{
                    legend:{position:"top"},
                    title:{display:true ,text:""}
                  },
                  
                }}
                />
              </div>
            </div>
          </div>
        </div>
        <div >
          <p className="pl-10">Data source: <span className=" text-blue-600 text-xl font-bold">frankfurter API</span> </p>
          <p className="pl-10 pb-5">Last updated: <span className=" text-blue-600 text-xl font-bold">{updatingDate}</span> </p>
        </div>
      </div>
    </div>
  )
}

export default CurrencyConverter
