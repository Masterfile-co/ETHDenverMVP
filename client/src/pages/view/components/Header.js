import React from "react";

export default function Header({ title }) {
  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          {title ? title : "Title"}
        </h1>
      </div>
    </header>
  );
}
