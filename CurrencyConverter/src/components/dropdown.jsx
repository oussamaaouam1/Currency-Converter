/* eslint-disable react/prop-types */


const CurrencyDropdown = ({
  currencies,
  currency,
  setCurrency,
  title= "",
}) => {

  return (
    <div>
      <label htmlFor= {title} className="block">{title}</label>
      <select 
        value={currency}
        onChange={(e)=>setCurrency(e.target.value)}
        className="w-28 h-8 rounded-md border border-gray-300 sm:bg-p shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:bg-blue-200 sm:h-9 sm:w-36 md:bg-white">
        {currencies?.map((currency) => {
        return (
        <option value={currency} key={currency}>
          {currency}
        </option>
        );
        })}
      </select>
    </div>
  );
}

export default CurrencyDropdown
