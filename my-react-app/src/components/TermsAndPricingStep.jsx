"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeftCircle } from "lucide-react"
import ProgressBar from "./ProgressBar"
import PricingCard from "./PricingCard" // Assuming this component is correctly styled as per your old code

const TermsAndPricingStep = () => {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null) // State to manage selected plan

  const handleNext = () => {
    // You might want to add validation here to ensure a plan is selected
    // before navigating to /auth
    navigate('/auth')
  }

  const handlePrev = () => {
    navigate('/onboarding/personal-info/4') // Navigate back to the last personal info step
  }

  // Pricing plans from your old codebase
  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      features: [
        "Designed for individuals, non-commercial use",
        "Includes access to core services",
        "Limited access to online educational resources",
        "Basic community features",
        "A restricted social network profile"
      ],
      bgColor: "bg-gray-700",
      textColor: "text-gray-300",
      borderColor: "border-gray-600"
    },
    {
      id: "premium",
      name: "Premium",
      price: 299,
      features: [
        "Designed for individuals, non-commercial use",
        "Includes access to core services",
        "Limited access to online educational resources",
        "Basic trading tools",
        "A restricted social network profile"
      ],
      bgColor: "bg-blue-600",
      textColor: "text-white",
      borderColor: "border-blue-500"
    },
    {
      id: "elite",
      name: "Elite",
      price: 999,
      features: [
        "Designed for individuals, non-commercial use",
        "Includes access to core services",
        "Limited access to online educational resources",
        "Advanced trading tools",
        "A restricted social network profile"
      ],
      bgColor: "bg-gray-700",
      textColor: "text-gray-300",
      borderColor: "border-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 md:block">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WEB%20BACKGROUND.png-OZ4OMdtxyVzgNZTsKH6DnBI8zA47Ol.jpeg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 md:hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MOBILE%20BACKGROUND.jpg-PHaF8vfpeVmOjN6jtm4jvvI91pnyCR.jpeg"
          alt="Mobile Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10">
        <ProgressBar progress={50} />

        <div className="min-h-screen flex flex-col justify-center px-4 py-8">
          <div className="flex-1">
            <div className="max-w-5xl mx-auto">
              {/* Step Indicator */}
              <div className="flex items-center mb-16 text-white">
                <button onClick={handlePrev} className="flex items-center justify-center rounded-full mr-3">
                  <ArrowLeftCircle className="w-8 h-8" />
                </button>
                <span className="text-sm">Step 2 of 4</span>
              </div>

              {/* Program Overview - From old design */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Program Overview</h2>
                <p className="text-gray-300 leading-relaxed">
                  This program provides users with access to a range of services, including [insert specific services here,
                  e.g., online educational resources, a trading platform, software tools, a social network, etc.]. Users may
                  be required to create an account to access certain features. The program is designed for personal and
                  non-commercial use. All content, trademarks, and intellectual property associated with the services are
                  owned or licensed by us. Users are responsible for their account activity and any content they submit.
                </p>
              </div>

              {/* Terms & Conditions - From old design */}
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Terms & Conditions</h2>
                <div className="text-gray-300 text-sm space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                    <p>
                      By accessing or using our services, you agree to be bound by these Terms and Conditions ("Terms" ). If
                      you do not agree to these Terms, you may not use our services.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">2. Use of Services</h3>
                    <p>
                      Our services are intended for your personal and non-commercial use. You may not modify, copy,
                      distribute, transmit, display, perform, reproduce, publish, license, create derivative works from,
                      transfer, or sell any information, software, products or services obtained from our services.
                    </p>
                  </div >

                  <div>
                    <h3 className="font-semibold text-white mb-2">3. Account Registration</h3>
                    <p>You may be required to register an account to access certain features of our services.</p>
                    <p>
                      You agree to provide accurate, current, and complete information during the registration process and to
                      update such information to keep it accurate.
                    </p>
                    <p>
                      You are responsible for safeguarding your account password. You agree not to disclose your password to
                      any third party.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">4. User Content</h3>
                    <p>
                      You are solely responsible for any content you submit, post, or display on or through our services
                      ("User Content").
                    </p>
                    <p>
                      You grant us a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, and transferable license
                      to use, reproduce, distribute, prepare derivative works of, display, and perform such User Content.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">5. Prohibited Conduct</h3>
                    <p>You agree not to engage in any of the following prohibited activities:</p>
                    <p>Violate any national law, regulation, ordinance, directive, or policy;</p>
                    <p>
                      Infringe any patent, trademark, trade secret, copyright, right of publicity, or other right of any other
                      person or entity;
                    </p>
                  </div>
                  {/* ... (rest of the terms from your old code) */}
                  <div>
                    <h3 className="font-semibold text-white mb-3">6. Prohibited Conduct</h3>
                    <p className="leading-relaxed">You agree not to use our services for any illegal purpose.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">7. Disclaimer of Warranties</h3>
                    <p className="leading-relaxed">
                      Our services are provided to you "as is" and "as available" basis. We make no warranties, express or
                      implied, including, but not limited to, implied warranties of merchantability, fitness for a
                      particular purpose, and non-infringement.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">8. Limitation of Liability</h3>
                    <p className="leading-relaxed">
                      We will not be liable for any direct, indirect, incidental, special, consequential or exemplary
                      damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other
                      intangible losses, resulting from your use of our services.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">9. Indemnification</h3>
                    <p className="leading-relaxed">
                      You agree to indemnify and hold us harmless from any claim or demand, including reasonable attorneys'
                      fees, made by any third party due to or arising out of your use of our services, your violation of
                      these Terms, or your violation of the rights of another.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">10. Changes to Terms</h3>
                    <p className="leading-relaxed">
                      We reserve the right to modify these Terms at any time. If we make material changes to these Terms, we
                      will notify you by email or through a notice on our services. Your continued use of our services after
                      the effective date of the revised Terms constitutes your acceptance of the revised Terms.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">11. Governing Law</h3>
                    <p className="leading-relaxed">
                      These Terms shall be governed by and construed in accordance with the laws of [Your Country/State],
                      without regard to its conflict of law provisions.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">12. Contact Us</h3>
                    <p className="leading-relaxed">
                      If you have any questions about these Terms, please contact us at [Lorem Ipsum].
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing - From old design */}
              <div className="bg-gray-900 bg-opacity-40 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-8 text-center">Pricing</h2>

                <div className="grid md:grid-cols-3 items-end gap-4 relative">
                  {plans.map((plan, index) => (
                    <PricingCard
                      key={plan.id}
                      plan={plan}
                      selectedPlan={selectedPlan}
                      onSelect={setSelectedPlan}
                      isFeatured={index === 1} // 'Premium' plan is featured in old design
                    />
                  ))}
                </div>
              </div>

              {/* Continue Button - Text changed to "Start Application" as per old design */}
              <div className="text-center mb-16">
                <button
                  onClick={handleNext}
                  className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Start Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsAndPricingStep
