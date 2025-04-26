"use client";

import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";


interface OptionType {
  value: string;
  label: string;
}

const defaultOptions: OptionType[] = [
  { value: "india", label: "India" },
  { value: "uae", label: "UAE" },
  { value: "others", label: "Others" },
];

export default function AudienceSelect() {
  const [options, setOptions] = useState<OptionType[]>(defaultOptions);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);

  // Load saved options
  useEffect(() => {
    const saved = localStorage.getItem("audienceOptions");
    if (saved) {
      setOptions(JSON.parse(saved));
    }
  }, []);

  // Save whenever options update
  useEffect(() => {
    localStorage.setItem("audienceOptions", JSON.stringify(options));
  }, [options]);

  const handleCreate = (inputValue: string) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    setSelectedOption(newOption);
  };

  const handleChange = (option: OptionType | null) => {
    setSelectedOption(option);
  };

  const handleDelete = (value: string) => {
    const filteredOptions = options.filter((opt) => opt.value !== value);
    setOptions(filteredOptions);
    if (selectedOption?.value === value) {
      setSelectedOption(null);
    }
  };

  // Custom Option rendering to add ✖️ delete button
  const CustomOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <span>{data.label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(data.value);
          }}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <X size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="w-[80%]">
      <label htmlFor="audience" className="text-[15px] font-inter-medium mb-1 block">
        Audience
      </label>
      <CreatableSelect
        id="audience"
        isClearable
        options={options}
        value={selectedOption}
        onChange={handleChange}
        onCreateOption={handleCreate}
        placeholder="Select or create Audience"
        components={{ Option: CustomOption }}
      />
    </div>
  );
}
