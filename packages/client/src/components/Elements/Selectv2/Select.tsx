import { Popover } from "@headlessui/react";
import React from "react";

interface SelectProps<T> {
  value: T;
  options: { key: T; title: string }[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  noDataPlaceholder?: string;
  id?: string;
}

const Select = <T,>({
  value,
  options,
  onChange,
  placeholder,
  className,
  buttonClassName,
  panelClassName,
  noDataPlaceholder,
  id,
}: SelectProps<T>) => {
  return (
    <Popover
      className={`relative w-full font-roboto font-normal text-[14px] leading-[22px] text-[#111827] ${
        className ? className : ""
      }`}
    >
      {({ close }) => (
        <>
          <Popover.Button
            className={`w-full ${buttonClassName ? buttonClassName : ""}`}
            id={id}
          >
            <div className="border-[1px] border-[#E5E7EB] rounded-[2px] bg-white px-[12px] py-[4px] flex items-center justify-between gap-[6px]">
              <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {options.find((option) => option.key === value)?.title ||
                  placeholder}
              </div>
              <div>
                <svg
                  width="11"
                  height="8"
                  viewBox="0 0 11 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.8919 0.572271H9.88744C9.81914 0.572271 9.75485 0.605754 9.71467 0.660664L5.90976 5.90531L2.10485 0.660664C2.06467 0.605754 2.00038 0.572271 1.93208 0.572271H0.927617C0.840563 0.572271 0.789671 0.671379 0.840563 0.742361L5.56289 7.25263C5.73431 7.48834 6.08521 7.48834 6.2553 7.25263L10.9776 0.742361C11.0299 0.671379 10.979 0.572271 10.8919 0.572271Z"
                    fill="#9CA3AF"
                  />
                </svg>
              </div>
            </div>
          </Popover.Button>

          <Popover.Panel
            className={`absolute translate-y-[5px] z-10 ${
              panelClassName ? panelClassName : ""
            }`}
            style={{
              boxShadow:
                "0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
            }}
          >
            <div
              className="bg-white py-[4px] min-w-[200px] max-w-full w-fit"
              style={{
                boxShadow:
                  "0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
              }}
            >
              {options.length === 0 ? (
                <div className="px-[12px] py-[5px] hover:bg-[#F3F4F6] select-none text-[#9CA3AF] text-center">
                  {noDataPlaceholder}
                </div>
              ) : (
                options.map((option, i) => (
                  <div
                    key={i}
                    className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-[12px] py-[5px] hover:bg-[#F3F4F6] select-none cursor-pointer"
                    onClick={() => {
                      onChange(option.key);
                      close();
                    }}
                    data-option={option.key}
                  >
                    {option.title}
                  </div>
                ))
              )}
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default Select;
