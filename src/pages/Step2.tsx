import Header from "./header/Header";
import Footer from "./footer/Footer";
import Step2Partial from "../steps-partials/Step2Partial";

function Step2() {
  return (
    <div className="flex bg-white ">
      {/* Content area */}
      <div className="   flex flex-col flex-1 ">
        {/*  Site header */}
        <Header />
        <main className="flex max-w-[1240px] w-full items-center flex-col justify-center py-12 mx-auto">
          <Step2Partial />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Step2;
