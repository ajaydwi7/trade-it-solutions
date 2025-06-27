// components/PricingCard.jsx
import React from "react";

const PricingCard = ({ plan, selectedPlan, onSelect, isFeatured }) => {
  if (!plan) return null; // Prevents error if plan is undefined

  return (
    <div
      className={`
        relative transition-all duration-300 ease-in-out
        ${isFeatured ? "z-10 scale-[1.15] -mt-8 shadow-2xl shadow-blue-500/20" : "z-0 scale-100 opacity-80"}
      `}
    >
      <div
        className={`rounded-2xl p-6 border min-h-[500px] flex flex-col
          ${selectedPlan === plan.id ? `${plan.borderColor} shadow-lg` : "border-gray-700"}
          bg-gray-900 bg-opacity-40 backdrop-blur-xl
        `}
      >
        <div className={`${plan.bgColor} rounded-lg px-4 py-2 mb-4 text-center`}>
          <span className={`text-sm font-medium ${plan.textColor}`}>{plan.name}</span>
        </div>

        <div className={`text-5xl font-extrabold mb-4 text-center ${isFeatured ? "text-white" : "text-gray-300"}`}>
          ${plan.price}
        </div>

        <div className="text-gray-400 text-sm space-y-2 mb-6 flex-grow">
          {plan.features.map((feature, i) => (
            <p key={i} className="text-center">{feature}</p>
          ))}
        </div>

        <div className="flex justify-center mt-auto pt-4">
          <input
            type="radio"
            name="pricing"
            id={plan.id}
            checked={selectedPlan === plan.id}
            onChange={() => onSelect(plan.id)}
            className="h-5 w-5 text-blue-500 accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
