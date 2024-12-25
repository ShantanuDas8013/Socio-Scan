import { testimonials } from "../constants";

const Testimonials = () => {
  return (
    <div className="mt-20 tracking-wide">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-10 lg:my-20 dark:text-white text-neutral-900">
        What People are saying
      </h2>
      <div className="flex flex-wrap justify-center">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-4 py-2">
            <div className="bg-white dark:bg-neutral-900 rounded-md p-6 text-md border border-neutral-200 dark:border-neutral-800 font-thin dark:text-white text-neutral-900 transition-colors">
              <p>{testimonial.text}</p>
              <div className="flex mt-8 items-start">
                <img
                  className="w-12 h-12 mr-6 rounded-full border border-neutral-200 dark:border-neutral-300"
                  src={testimonial.image}
                  alt=""
                />
                <div>
                  <h6 className="dark:text-white text-neutral-900">
                    {testimonial.user}
                  </h6>
                  <span className="text-sm font-normal italic dark:text-neutral-600 text-neutral-500">
                    {testimonial.company}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
