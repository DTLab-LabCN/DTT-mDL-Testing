import Header from "../pages/header/Header";
import Footer from "../pages/footer/Footer";
import Step7Partial from "../steps-partials/Step7Partial";

function Step7() {
  return (
    <div className="flex  bg-white">
      {/* Content area */}
      <div className="   flex flex-col flex-1 ">
        {/*  Site header */}
        <Header />
        <main className="flex max-w-[1240px] w-full items-center flex-col justify-center py-12 mx-auto">
          <Step7Partial />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Step7;
