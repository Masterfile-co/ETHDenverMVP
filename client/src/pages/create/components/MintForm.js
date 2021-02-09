import React from "react";

export default function MintForm() {
  return (
    <form
      className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
      action="#"
      method="POST"
    >
      <div>
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          for="first_name"
        >
          First name
        </label>
        <div className="mt-1">
          <input
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="first_name"
            type="text"
            name="first_name"
            autocomplete="given-name"
          />
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          for="last_name"
        >
          Last name
        </label>
        <div className="mt-1">
          <input
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="last_name"
            type="text"
            name="last_name"
            autocomplete="family-name"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          for="company"
        >
          Masterfile Title
        </label>
        <div className="mt-1">
          <input
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="company"
            type="text"
            name="company"
            autocomplete="organization"
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          for="email"
        >
          Artwork
        </label>
        <div className="mt-1">
          <input
            type="file"
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="artwork"
            name="artwork"
            autocomplete="artwork"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          for="message"
        >
          Description
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <textarea
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="message"
            name="message"
            rows="4"
          ></textarea>
        </div>
      </div>
      <div className="sm:col-span-2">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span
              className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:shadow-outline"
              role="checkbox"
              tabindex="0"
              aria-checked="false"
            >
              <span
                className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200"
                aria-hidden="true"
              ></span>
            </span>
          </div>
          <div className="ml-3">
            <p className="text-base leading-6 text-gray-500">
              By selecting this, you agree to the
              <a className="font-medium text-gray-700 underline" href="#">
                Privacy Policy
              </a>
              and
              <path className="font-medium text-gray-700 underline" href="#">
                Cookie Policy
              </path>
              .
            </p>
          </div>
        </div>
      </div>
      <div className="sm:col-span-2">
        <span className="w-full inline-flex rounded-md shadow-sm">
          <button
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
            type="button"
          >
            Create Masterfile
          </button>
        </span>
      </div>
    </form>
  );
}
