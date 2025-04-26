import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { X } from "lucide-react";
import { OptionProps } from 'react-select';


type OptionType = {
  value: string;
  label: string;
};


type Props = {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  defaultOptions: OptionType[];
};

const AudienceSelect: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  defaultOptions,
}) => {
  const [options, setOptions] = useState<OptionType[]>(defaultOptions);

  useEffect(() => {
    const storedOptions = localStorage.getItem('audienceOptions');
    if (storedOptions) {
      setOptions(JSON.parse(storedOptions)); // 👈 restore
    }
  }, []);
  
  
  useEffect(() => {
    localStorage.setItem(`select-options-${name}`, JSON.stringify(options));
  }, [options, name]);
  

  const handleCreate = (newValue: string) => {
    const newOption = { label: newValue, value: newValue };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    onChange([...value, newValue]); // Select the newly created option
  };
  

  const handleDelete = (valueToDelete: string) => {
    const filteredOptions = options.filter((opt) => opt.value !== valueToDelete);
    setOptions(filteredOptions);
    onChange(value.filter((v) => v !== valueToDelete)); // Deselect if selected
  };



  const CustomOption = (props: OptionProps<OptionType, true>) => {
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
      <CreatableSelect
      isMulti
      isClearable
      name={name}
      value={options.filter((opt) => value.includes(opt.value))}
      onChange={(selected) =>
        onChange(selected ? selected.map((s: OptionType) => s.value) : [])
      }
      onCreateOption={handleCreate}
        options={options}
        placeholder={`Select or create ${label}`}
        components={{ Option: CustomOption }}
        className="rounded-md text-[13px] text-[#000] cursor-pointer"
      />
  );
};

export default AudienceSelect;
