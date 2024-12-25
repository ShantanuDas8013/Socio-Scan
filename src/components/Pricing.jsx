import { CheckCircle2 } from "lucide-react";
import { pricingOptions } from "../constants";

const Pricing = () => {
  return (
    <div className="mt-20">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide dark:text-white text-neutral-900">
        Pricing
      </h2>
      <div className="flex flex-wrap">
        {pricingOptions.map((option, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-2">
            <div className="p-10 border dark:border-neutral-700 border-neutral-200 rounded-xl bg-white dark:bg-neutral-900 transition-colors">
              <p className="text-4xl mb-8">
                {option.title}
                {option.title === "Pro" && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-400 text-transparent bg-clip-text text-xl mb-4 ml-2">
                    (Most Popular)
                  </span>
                )}
              </p>
              <p className="mb-8">
                <span className="text-5xl mt-6 mr-2 dark:text-white text-neutral-900">
                  {option.price}
                </span>
                <span className="dark:text-neutral-400 text-neutral-500 tracking-tight">
                  /Month
                </span>
              </p>
              <ul>
                {option.features.map((feature, index) => (
                  <li
                    key={index}
                    className="mt-8 flex items-center dark:text-white text-neutral-900"
                  >
                    <CheckCircle2 className="text-green-500" />
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="inline-flex justify-center items-center text-center w-full h-12 p-5 mt-20 tracking-tight text-xl hover:bg-orange-900 border border-orange-900 rounded-lg transition duration-200 dark:text-white text-neutral-900"
              >
                Subscribe
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
