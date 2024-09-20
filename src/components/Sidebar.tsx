import React from "react";
import Img from "../images/Img.png";
import { useNavigate } from "react-router-dom";
import { useBluetooth } from "../utils/BluetoothContext";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const { device } = useBluetooth();

  return (
    <div className="rounded-md border border-gray-300 justify-start items-start gap-3 p-2 sm:p-3 h-full">
      <img src={Img} alt="" className="w-full max-w-xs sm:max-w-none" />
      <div className="h-24 px-2 flex flex-col justify-start items-start gap-2">
        <div className="flex flex-col items-start space-y-2 py-8">
          <button
            onClick={() => navigate("/")}
            className="btn bg-blue-500 text-white font-semibold py-1.5 px-3 text-sm rounded-lg hover:bg-blue-600 focus:outline-none w-full sm:py-2 sm:px-4 sm:text-base"
          >
            Certify your mDL Mobile App
          </button>
          <button className="btn bg-blue-100 text-blue-500 font-semibold py-1.5 px-3 text-sm rounded-lg hover:bg-blue-200 focus:outline-none w-full sm:py-2 sm:px-4 sm:text-base">
            Help & Support
          </button>
          <div className="py-12 w-full">
            <div className=" text-[#68727d] text-base font-medium  leading-normal">
              Connection Status
            </div>

            <div className=" px-2.5 my-4 py-3 bg-blue-50 w-full rounded-md justify-start items-center gap-2.5 inline-flex">
              {device?.gatt?.connected ? (
                <>
								<div className="rounded-md justify-center items-center flex">
									<svg
										width="36"
										height="36"
										viewBox="0 0 36 36"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M0 9.6C0 6.23968 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H26.4C29.7603 0 31.4405 0 32.7239 0.653961C33.8529 1.2292 34.7708 2.14708 35.346 3.27606C36 4.55953 36 6.23969 36 9.6V26.4C36 29.7603 36 31.4405 35.346 32.7239C34.7708 33.8529 33.8529 34.7708 32.7239 35.346C31.4405 36 29.7603 36 26.4 36H9.6C6.23968 36 4.55953 36 3.27606 35.346C2.14708 34.7708 1.2292 33.8529 0.653961 32.7239C0 31.4405 0 29.7603 0 26.4V9.6Z"
											fill="#FFFFFF"
										/>
										<path
											d="M22.7365 13L13.2564 22.7233C12.8967 23.0922 12.3136 23.0922 11.9539 22.7233L8 18.668M18.5199 22.7233L28 13"
											stroke="#0A77FF"
											strokeWidth="2"
											strokeLinecap="round"
										/>
									</svg>
								</div>
								<div className="grow shrink basis-0 h-6 justify-start items-start gap-4 flex">
									<div className="grow shrink basis-0 self-stretch flex-col justify-start items-start gap-0.5 inline-flex">
										<div className="text-gray-500 text-base font-base font-['Inter'] leading-normal">
											 Connected to <span className="text-blue-500 font-medium">
												{device.name} </span>
										</div>
									</div>
								</div>
							</>
              ) : (
                <>
                  <div className="p-1.5 rounded-md justify-center items-center flex">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 9.6C0 6.23968 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H26.4C29.7603 0 31.4405 0 32.7239 0.653961C33.8529 1.2292 34.7708 2.14708 35.346 3.27606C36 4.55953 36 6.23969 36 9.6V26.4C36 29.7603 36 31.4405 35.346 32.7239C34.7708 33.8529 33.8529 34.7708 32.7239 35.346C31.4405 36 29.7603 36 26.4 36H9.6C6.23968 36 4.55953 36 3.27606 35.346C2.14708 34.7708 1.2292 33.8529 0.653961 32.7239C0 31.4405 0 29.7603 0 26.4V9.6Z"
                      fill="#FDF6EA"
                    />
                    <path
                      d="M16.5812 25.3248L15.8097 25.9609L16.5812 25.3248ZM8.19253 15.1513L8.96407 14.5151L8.96407 14.5151L8.19253 15.1513ZM27.8075 15.1513L28.579 15.7875L28.579 15.7875L27.8075 15.1513ZM19.4188 25.3248L20.1903 25.9609L19.4188 25.3248ZM8.15753 14.1181L7.34392 13.5367L8.15753 14.1181ZM27.8425 14.1181L28.6561 13.5367L28.6561 13.5367L27.8425 14.1181ZM19 12.9944C18.9969 12.4421 18.5467 11.9969 17.9944 12C17.4421 12.0031 16.9969 12.4533 17 13.0056L19 12.9944ZM17.0225 16.9993C17.0256 17.5516 17.4758 17.9968 18.0281 17.9937C18.5803 17.9906 19.0255 17.5403 19.0224 16.9881L17.0225 16.9993ZM19 19.99C19 19.4377 18.5523 18.99 18 18.99C17.4477 18.99 17 19.4377 17 19.99H19ZM17 20C17 20.5523 17.4477 21 18 21C18.5523 21 19 20.5523 19 20H17ZM17.3528 24.6886L8.96407 14.5151L7.42099 15.7875L15.8097 25.9609L17.3528 24.6886ZM27.0359 14.5151L18.6472 24.6886L20.1903 25.9609L28.579 15.7875L27.0359 14.5151ZM8.97113 14.6996C13.449 8.43348 22.551 8.43348 27.0289 14.6996L28.6561 13.5367C23.3805 6.15443 12.6195 6.15443 7.34392 13.5367L8.97113 14.6996ZM28.579 15.7875C29.1109 15.1424 29.1412 14.2156 28.6561 13.5367L27.0289 14.6996C26.9886 14.6432 26.99 14.5708 27.0359 14.5151L28.579 15.7875ZM8.96407 14.5151C9.00998 14.5708 9.0114 14.6432 8.97113 14.6996L7.34392 13.5367C6.85875 14.2156 6.88912 15.1424 7.421 15.7875L8.96407 14.5151ZM15.8097 25.9609C16.9521 27.3464 19.0479 27.3464 20.1903 25.9609L18.6472 24.6886C18.3048 25.1038 17.6952 25.1038 17.3528 24.6886L15.8097 25.9609ZM17 13.0056L17.0225 16.9993L19.0224 16.9881L19 12.9944L17 13.0056ZM17 19.99V20H19V19.99H17Z"
                      fill="#DC9D24"
                    />
                  </svg>
                </div>
                  <div className="grow shrink basis-0 h-6 justify-start items-start gap-4 flex">
                    <div className="grow shrink basis-0 self-stretch flex-col justify-start items-start gap-0.5 inline-flex">
                      <div className="text-[#dc9d24] text-base font-semibold font-['Inter'] leading-normal">
                        Not Connected
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
