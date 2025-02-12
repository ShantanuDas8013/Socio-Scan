import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";

const HeroSection = () => {
  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide dark:text-white text-neutral-900">
        Socio-Scan
        <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          {" "}
          for Applicants
        </span>
      </h1>
      <p className="mt-10 text-lg text-center dark:text-neutral-500 text-neutral-600 max-w-4xl">
        Fast, Ethical Social Media screening for hiring decisions
      </p>
      <div className="flex justify-center my-10">
        <a
          href="#"
          className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md text-white"
        >
          Start for free
        </a>
        <a
          href="#"
          className="py-3 px-4 mx-3 rounded-md border border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600 hover:border-neutral-400 transition-colors"
        >
          Documentation
        </a>
      </div>
      <div className="flex mt-10 justify-center">
        <video
          autoPlay
          loop
          muted
          className="rounded-lg w-1/2 border dark:border-orange-700 border-orange-500 shadow-sm dark:shadow-orange-400/20 shadow-orange-400/40 mx-2 my-4"
        >
          <source src={video1} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <video
          autoPlay
          loop
          muted
          className="rounded-lg w-1/2 border dark:border-orange-700 border-orange-500 shadow-sm dark:shadow-orange-400/20 shadow-orange-400/40 mx-2 my-4"
        >
          <source src={video2} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default HeroSection;
