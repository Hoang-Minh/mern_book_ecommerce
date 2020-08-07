import React, { useState } from "react";

function RadioBox({ prices, handleFilters }) {
  const [value, setValue] = useState(0);

  const handleChange = (event) => {
    handleFilters(event.target.value);
    setValue(event.target.value);
  };

  return prices.map((price, key) => {
    return (
      <div key={key}>
        <input
          onChange={handleChange}
          value={`${price._id}`}
          type="radio"
          name={price}
          className="mr-2 ml-4"
        ></input>
        <label className="form-check-label">{price.name}</label>
      </div>
    );
  });
}
export default RadioBox;
