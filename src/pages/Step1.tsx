import Header from "./header/Header";
import Footer from "./footer/Footer";
import Step1Partial from "../steps-partials/Step1Partial";

function Step1() {
  return (
    <div className="flex bg-white ">
      {/* Content area */}
      <div className="   flex flex-col flex-1 ">
        {/*  Site header */}
        <Header />
        <main className="flex max-w-[1240px]  w-full items-center  flex-col justify-center py-12 mx-auto">
          <Step1Partial />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Step1;
