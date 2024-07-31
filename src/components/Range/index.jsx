import React, { useState, useEffect } from "react";
import { Range } from "react-range";

const RangeComponent = ({ range, onPriceChange }) => {
  const [values, setValues] = useState(range);

  useEffect(() => {
    setValues(range);
  }, [range]);

  const handleChange = (newValues) => {
    setValues(newValues);
    onPriceChange(newValues);
  };

  return (
    <Range
      step={0.1}
      min={1000000}
      max={100000000}
      values={values}
      onChange={handleChange}
      renderTrack={({ props, children }) => (
        <div
          className="bg-gray-300"
          {...props}
          style={{
            ...props.style,
            height: "3px",
            width: "100%",
          }}
        >
          {children}
        </div>
      )}
      renderThumb={({ props }) => (
        <div
          className="bg-yellow-400 rounded-full"
          {...props}
          style={{
            ...props.style,
            height: "10px",
            width: "10px",
          }}
        />
      )}
    />
  );
};

export default RangeComponent;
