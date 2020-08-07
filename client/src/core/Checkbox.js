import React, { useState, useEffect } from "react";
import { check } from "express-validator";
import { filter } from "lodash";

function Checkbox({ categories, handleFilters }) {
  const [checked, setChecked] = useState([]);

  const handleToggle = (id) => () => {
    // return the first index of -1
    const currentCategoryId = checked.indexOf(id);
    const newCheckedCategoryId = [...checked];

    // if currently checked was not already in checked state > push
    // else pull/take off
    if (currentCategoryId === -1) {
      newCheckedCategoryId.push(id);
    } else {
      newCheckedCategoryId.splice(currentCategoryId, 1);
    }

    console.log(newCheckedCategoryId);
    setChecked(newCheckedCategoryId);
    handleFilters(newCheckedCategoryId);
  };

  return categories.map((category, key) => {
    return (
      <li key={key} className="list-unstyled">
        <input
          onChange={handleToggle(category._id)}
          type="checkbox"
          className="form-check-input"
          value={checked.indexOf(category._id === -1)}
        ></input>
        <label className="form-check-label">{category.name}</label>
      </li>
    );
  });
}

export default Checkbox;
