import Header from "./header/Header";
import Footer from "./footer/Footer";
import HomePartial from "../steps-partials/HomePartial";

function Home() {
  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden">
      {/* Sidebar */}

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header />

        <main className="flex max-w-[1240px] w-full items-center flex-col justify-center py-12 mx-auto">
          <HomePartial />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
