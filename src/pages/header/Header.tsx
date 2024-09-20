import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import NB from "../../images/NB.png";

const Navbar = () => {
  // State to manage the navbar's visibility
  const [nav, setNav] = useState(false);

  // Toggle function to handle the navbar's display
  const handleNav = () => {
    setNav(!nav);
  };

  // Array containing navigation items
  const navItems = [{ id: 1, text: "Home" }];

  return (
    <div className="bg-slate-900 text-gray-300 ">
      <div className="flex justify-between max-w-[1240px] items-center h-24  mx-auto px-4 text-white">
        {/* Logo */}

        {/* Desktop Navigation */}
        <ul className="hidden md:flex">
          {navItems.map((item) => (
            <li
              key={item.id}
              className="p-4 hover:bg-[#00df9a] rounded-xl m-2 cursor-pointer duration-300 hover:text-black"
            >
              {item.text}
            </li>
          ))}
        </ul>

        {/* Mobile Navigation Icon */}
        <div onClick={handleNav} className="block md:hidden" role="none">
          {nav ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </div>

        {/* Mobile Navigation Menu */}
        <ul
          className={
            nav
              ? "fixed md:hidden left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500"
              : "ease-in-out w-[60%] duration-500 fixed top-0 bottom-0 left-[-100%]"
          }
        >
          {/* Mobile Logo */}
          <img src={NB} alt="logo" className="w-28 " />

          {/* Mobile Navigation Items */}
          {navItems.map((item) => (
            <li
              key={item.id}
              className="p-4 border-b rounded-xl hover:bg-[#00df9a] duration-300 hover:text-black cursor-pointer border-gray-600"
            >
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
