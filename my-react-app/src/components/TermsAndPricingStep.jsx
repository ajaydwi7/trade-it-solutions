"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

const TermsAndPricingStep = () => {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleNext = () => {
    navigate("/auth")
  }

  const handlePrev = () => {
    navigate("/onboarding/personal-info/4")
  }

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      features: [
        "Designed for individual, non-commercial use.",
        "Includes access to core services, such as:",
        "Limited access to online educational resources",
        "Basic trading tools",
        "A restricted social network profile",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 299,
      features: [
        "Designed for individual, non-commercial use.",
        "Includes access to core services, such as:",
        "Limited access to online educational resources",
        "Basic trading tools",
        "A restricted social network profile",
      ],
    },
    {
      id: "class",
      name: "Class",
      price: 999,
      features: [
        "Designed for individual, non-commercial use.",
        "Includes access to core services, such as:",
        "Limited access to online educational resources",
        "Basic trading tools",
        "A restricted social network profile",
      ],
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#101019" }}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-2.5 bg-gray-800 z-10">
        <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: "50%" }} />
      </div>
      <div className="absolute top-6 right-6 text-indigo-500 text-base font-medium z-10">50%</div>

      <div className="relative z-10 min-h-screen">
        {/* Main Container */}
        <div className="max-w-[1136px] mx-auto px-4 pt-24">
          {/* Top nav Back */}
          <div className="flex items-center gap-4 text-white mb-28">
            <button
              onClick={handlePrev}
              className="rounded-full border border-white/20 hover:bg-white/10 p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-xl font-medium">
              Step <span className="text-white">2</span> <span className="text-gray-600">of 4</span>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-black/70 rounded-[48px] border border-indigo-500/50 backdrop-blur-2xl p-6 mb-8">
            {/* Program Overview */}
            <div className="rounded-3xl border border-gray-600 p-6 mb-7">
              <div className="max-w-[1046px] mx-auto">
                <h2 className="text-4xl font-normal text-white text-center mb-6">Program Overview</h2>
                <p className="text-white text-sm font-normal leading-7 tracking-tight text-center max-w-[976px] mx-auto">
                  This program provides users with access to a range of services, including [Insert specific services
                  here, e.g., online educational resources, a trading platform, software tools, a social network, etc.].
                  Users may be required to create an account to access certain features. The program is designed for
                  personal and non-commercial use. All content, trademarks, and intellectual property associated with
                  the services are owned or licensed by us. Users are responsible for their account activity and any
                  content they submit.
                </p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className=" rounded-3xl border border-gray-600 p-6 mb-7">
              <h2 className="text-4xl font-normal text-white text-center mb-8">Terms & Conditions</h2>

              <div className="bg-gray-950 rounded-3xl border border-gray-600 p-9 max-h-[1116px] overflow-y-auto">
                <div className="text-white text-xs text-left leading-tight tracking-tight space-y-4">
                  <div>
                    <span className="font-bold">
                      1. Acceptance of Terms
                      <br />
                    </span>
                    <span className="font-normal">
                      By accessing or using our services, you agree to be bound by these Terms and Conditions ("Terms").
                      If you do not agree to these Terms, you may not access or use our services.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      2. Use of Services
                      <br />
                    </span>
                    <span className="font-normal">
                      Our services are intended for your personal and non-commercial use. You may not modify, copy,
                      distribute, transmit, display, perform, reproduce, publish, license, create derivative works from,
                      transfer, or sell any information, software, products or services obtained from our services.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      3. Account Registration
                      <br />
                    </span>
                    <span className="font-normal">
                      You may be required to register an account to access certain features of our services.
                      <br />
                      You agree to provide accurate, current, and complete information during the registration process
                      and to update such information to keep it accurate, current, and complete.
                      <br />
                      You are responsible for safeguarding your account password. You agree not to disclose your
                      password to any third party.
                      <br />
                      You agree to take sole responsibility for any activities or actions taken under your account,
                      whether or not you have authorized such activities or actions.
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      4. Intellectual Property
                      <br />
                    </span>
                    <span className="font-normal">
                      The content, trademarks, service marks, and logos contained in our services are owned by or
                      licensed to us and are subject to copyright and other intellectual property rights.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      5. User Content
                      <br />
                    </span>
                    <span className="font-normal">
                      You are responsible for any content you submit, post, or display on or through our services ("User
                      Content").
                      <br />
                      By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free, perpetual,
                      irrevocable, sublicensable, and transferable license to use, reproduce, modify, adapt, publish,
                      translate, create derivative works from, distribute, perform, and display such User Content.
                      <br />
                      You represent and warrant that you have the right to grant the license set out above.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      6. Prohibited Conduct
                      <br />
                    </span>
                    <span className="font-normal">
                      You agree not to:
                      <br />
                      Use our services for any illegal purpose.
                      <br />
                      Transmit any material that is unlawful, harmful, threatening, abusive, harassing, tortious,
                      defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially,
                      ethnically, or otherwise objectionable.
                      <br />
                      Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with
                      a person or entity.
                      <br />
                      Interfere with or disrupt our services or servers or networks connected to our services.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      7. Disclaimer of Warranties
                      <br />
                    </span>
                    <span className="font-normal">
                      Our services are provided on an "as is" and "as available" basis. We make no warranties, express
                      or implied, including, but not limited to, implied warranties of merchantability, fitness for a
                      particular purpose, and non-infringement.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      8. Limitation of Liability
                      <br />
                    </span>
                    <span className="font-normal">
                      We will not be liable for any direct, indirect, incidental, special, consequential, or exemplary
                      damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other
                      intangible losses, resulting from your use of our services.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      9. Indemnification
                      <br />
                    </span>
                    <span className="font-normal">
                      You agree to indemnify and hold us harmless from any claim or demand, including reasonable
                      attorneys' fees, made by any third party due to or arising out of your use of our services, your
                      violation of these Terms, or your violation of any rights of another.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      10. Changes to Terms
                      <br />
                    </span>
                    <span className="font-normal">
                      We reserve the right to modify these Terms at any time. If we make material changes to these
                      Terms, we will notify you by email or through a notice on our services. Your continued use of our
                      services after the effective date of the revised Terms constitutes your acceptance of the revised
                      Terms.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      11. Governing Law
                      <br />
                    </span>
                    <span className="font-normal">
                      These Terms shall be governed by and construed in accordance with the laws of [Your
                      Country/State], without regard to its conflict of law provisions.
                      <br />
                      <br />
                    </span>
                  </div>

                  <div>
                    <span className="font-bold">
                      12. Contact Us
                      <br />
                    </span>
                    <span className="font-normal">
                      If you have any questions about these Terms, please contact us at [Lorem Ipsum].
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className=" rounded-3xl border border-gray-600 p-6">
              <h2 className="text-4xl font-normal text-white text-center mb-12">Pricing</h2>

              <div className="flex justify-center items-end gap-8">
                {/* Basic Plan */}
                <div className="w-80 h-[560px] bg-gray-950 rounded-xl border border-gray-600 p-6 relative">
                  <div className="w-16 h-8 mx-auto mb-8 rounded-full border border-indigo-400 flex items-center justify-center">
                    <span className="text-indigo-400 text-xs font-normal">Basic</span>
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-white text-7xl font-bold">$0</span>
                  </div>

                  <div className="text-white text-[10px] font-normal leading-normal mb-8">
                    <p>Designed for individual, non-commercial use.</p>
                    <p>Includes access to core services, such as:</p>
                    <p>Limited access to online educational resources</p>
                    <p>Basic trading tools</p>
                    <p>A restricted social network profile</p>
                  </div>

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={() => setSelectedPlan("basic")}
                      className={`w-6 h-6 rounded-full border-2 ${selectedPlan === "basic" ? "border-indigo-500 bg-indigo-500" : "border-slate-600 bg-gray-800"
                        }`}
                    />
                  </div>
                </div>

                {/* Premium Plan - Featured */}
                <div className="w-96 h-[624px] rounded-xl border border-gray-600 p-6 relative transform scale-105">
                  <div className="w-20 h-8 mx-auto mb-8 rounded-full border border-indigo-400 flex items-center justify-center">
                    <span className="text-indigo-400 text-sm font-normal">Premium</span>
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-white text-8xl font-bold">$299</span>
                  </div>

                  <div className="text-white text-xs font-normal leading-relaxed mb-8">
                    <p>Designed for individual, non-commercial use.</p>
                    <p>Includes access to core services, such as:</p>
                    <p>Limited access to online educational resources</p>
                    <p>Basic trading tools</p>
                    <p>A restricted social network profile</p>
                  </div>

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={() => setSelectedPlan("premium")}
                      className={`w-6 h-6 rounded-full border-2 ${selectedPlan === "premium" ? "border-indigo-500 bg-indigo-500" : "border-slate-600 bg-gray-800"
                        }`}
                    />
                  </div>
                </div>

                {/* Class Plan */}
                <div className="w-80 h-[560px] bg-gray-950 rounded-xl border border-gray-600 p-6 relative">
                  <div className="w-16 h-8 mx-auto mb-8 rounded-full border border-indigo-400 flex items-center justify-center">
                    <span className="text-indigo-400 text-xs font-normal">Class</span>
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-white text-7xl font-bold">$999</span>
                  </div>

                  <div className="text-white text-[10px] font-normal leading-normal mb-8">
                    <p>Designed for individual, non-commercial use.</p>
                    <p>Includes access to core services, such as:</p>
                    <p>Limited access to online educational resources</p>
                    <p>Basic trading tools</p>
                    <p>A restricted social network profile</p>
                  </div>

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={() => setSelectedPlan("class")}
                      className={`w-6 h-6 rounded-full border-2 ${selectedPlan === "class" ? "border-indigo-500 bg-indigo-500" : "border-slate-600 bg-gray-800"
                        }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Application Button */}
          <button
            onClick={handleNext}
            className="w-full h-16 px-8 py-2.5 bg-indigo-500 rounded-xl text-white text-xl font-medium hover:bg-indigo-600 transition-colors mb-8"
          >
            Start Application
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsAndPricingStep
