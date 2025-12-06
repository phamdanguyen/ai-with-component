import { useState } from 'react'

function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      question: 'What is uniAI Super Chat?',
      answer: 'uniAI Super Chat is an AI-powered chat application that transforms text responses into interactive UI components. Instead of plain text, you get tables, charts, forms, and more based on your queries.',
    },
    {
      question: 'What types of components can be generated?',
      answer: 'We support 7 core component types: Tables (interactive data grids), Charts (visualizations), Cards (content blocks), Lists (organized items), Forms (smart inputs), Slides (presentations), and Reports (comprehensive documents).',
    },
    {
      question: 'How do I write effective prompts?',
      answer: 'Be specific about what you want to see. Instead of "show data", try "create a table showing top 10 products sorted by revenue". The more context you provide, the better the AI can generate the right component.',
    },
    {
      question: 'Can I customize the generated components?',
      answer: 'Yes! Most components support interaction - you can sort tables, filter data, click on chart elements, and submit forms. Advanced customization through settings will be available in future versions.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All data stays within your Odoo instance. We follow enterprise security standards including role-based access control, rate limiting for public endpoints, and CSRF protection.',
    },
    {
      question: 'How is this different from regular chatbots?',
      answer: 'Traditional chatbots return text. Super Chat returns interactive UI components that you can click, sort, filter, and interact with. It\'s like having a UI designer that instantly creates interfaces based on your needs.',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-4">Help Center</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions and get support for uniAI Super Chat.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">Documentation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Comprehensive guides and tutorials
          </p>
          <a href="/superchat/knowledge" className="text-primary-600 text-sm font-medium hover:underline">
            View Docs →
          </a>
        </div>

        <div className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-lg font-semibold mb-2">Try Playground</h3>
          <p className="text-sm text-gray-600 mb-4">
            Experiment with AI in real-time
          </p>
          <a href="/superchat/playground" className="text-primary-600 text-sm font-medium hover:underline">
            Launch →
          </a>
        </div>

        <div className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get help from our team
          </p>
          <a href="mailto:support@uni.ai.vn" className="text-primary-600 text-sm font-medium hover:underline">
            Email Us →
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <span className="text-gray-400">
                  {expandedFaq === index ? '−' : '+'}
                </span>
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Still have questions?</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input type="text" className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input type="email" className="input-field" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
