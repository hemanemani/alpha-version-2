import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { X } from "lucide-react";
import { OptionProps } from 'react-select';
import axiosInstance from "@/lib/axios";


type OptionType = {
  value: string;
  label: string;
  isDefault?:boolean;
  id?: number;
};

type AudienceApiResponse = {
  id: number;
  label: string;
  value: string;
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
  const fetchAudiences = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      // 1. Define default options
      const defaultOptions: OptionType[] = [
        { label: "India", value: "India", isDefault: true },
        { label: "UAE", value: "UAE", isDefault: true },
        { label: "Others", value: "Others", isDefault: true }
      ];

      // 2. Fetch from backend
      const res = await axiosInstance.get('/audiences', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedOptions: OptionType[] = res.data.map((item: AudienceApiResponse) => ({
        id: item.id,
        label: item.label,
        value: item.value,
        isDefault: false,
      }));

      // 3. Filter out duplicates (avoid adding a default if it’s already fetched)
      const mergedOptions = [
        ...defaultOptions,
        ...fetchedOptions.filter(
          (fetched) =>
            !defaultOptions.some((def) => def.value === fetched.value)
        ),
      ];

      setOptions(mergedOptions);
    } catch (err) {
      console.error('Failed to fetch audiences:', err);
    }
  };

  fetchAudiences();
}, []);




  const handleCreate = async (newValue: string) => {
    const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
    const newOption = { label: newValue, value: newValue };
    try {
        const res = await axiosInstance.post(
      '/audiences', newOption,
      { headers: { Authorization: `Bearer ${token}` } }
    );

        const created = res.data;
        setOptions([...options, created]);
        onChange([...value, created.value]);
      } catch (err) {
        console.error('Failed to create:', err);
      }

      };
  


  const handleDelete = async (valueToDelete: string) => {
    const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }
    const optionToDelete = options.find((opt) => opt.value === valueToDelete);
    if (!optionToDelete) return;

    try {
      await axiosInstance.delete(`/audiences/${optionToDelete.id}`,{
          headers: { Authorization: `Bearer ${token}` },
    });
      const updatedOptions = options.filter(opt => opt.value !== valueToDelete);
      setOptions(updatedOptions);
      onChange(value.filter((v) => v !== valueToDelete));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
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
          {!data.isDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(data.value);
              }}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X size={12} />
            </button>
          )}
      </div>
    );
  };


  return (
      <CreatableSelect
      isMulti
      isClearable
      name={name}
      value={options.filter((opt) => (value || []).includes(opt.value))}

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
