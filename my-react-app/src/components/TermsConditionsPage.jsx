"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle } from "lucide-react"

const TermsConditionsPage = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  const handleContinue = () => {
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 hidden md:block">
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

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8 pt-8">
            <button
              onClick={handleBack}
              className="flex items-center text-white hover:text-gray-300 transition-colors mr-4"
            >
              <ArrowLeft className="w-6 h-6 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
          </div>

          {/* Content */}
          <div className="bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-white mb-4">Trading Education Platform Terms of Service</h2>

              <div className="space-y-6 text-gray-300">
                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using our trading education platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Educational Purpose</h3>
                  <p>
                    Our platform provides educational content about trading and financial markets. All content is for educational purposes only and should not be considered as financial advice. Trading involves substantial risk and is not suitable for all investors.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Risk Disclosure</h3>
                  <p>
                    Trading in financial markets involves significant risk of loss. Past performance is not indicative of future results. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">4. User Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Provide accurate and complete information during registration</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Use the platform in accordance with applicable laws and regulations</li>
                    <li>Respect intellectual property rights of all content</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">5. Privacy Policy</h3>
                  <p>
                    We are committed to protecting your privacy. We collect and use your personal information in accordance with our Privacy Policy, which is incorporated into these terms by reference.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h3>
                  <p>
                    In no event shall our platform be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">7. Modifications</h3>
                  <p>
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform constitutes acceptance of the modified terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-white mb-3">8. Contact Information</h3>
                  <p>
                    If you have any questions about these Terms & Conditions, please contact us at support@tradingplatform.com
                  </p>
                </section>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              I Agree & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsConditionsPage

