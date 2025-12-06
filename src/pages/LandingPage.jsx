function LandingPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Transform AI Conversations into
          <span className="text-primary-600"> Interactive Experiences</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          uniAI Super Chat brings AI-powered UI generation to your fingertips.
          Turn plain text responses into beautiful, interactive components - tables, charts, forms, and more.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/superchat/expand" className="btn-primary text-lg px-8 py-3">
            Start Chatting
          </a>
          <a href="/superchat/demo" className="btn-secondary text-lg px-8 py-3">
            View Demo
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-center mb-12">7 Core GenUI Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: 'Tables', description: 'Interactive data tables with sorting and filtering', icon: '📊' },
            { name: 'Charts', description: 'Dynamic visualizations with multiple chart types', icon: '📈' },
            { name: 'Cards', description: 'Rich content cards with images and actions', icon: '🃏' },
            { name: 'Lists', description: 'Organized lists with custom styling', icon: '📝' },
            { name: 'Forms', description: 'Smart forms with validation and submission', icon: '📋' },
            { name: 'Slides', description: 'Presentation slides with navigation', icon: '🎬' },
            { name: 'Reports', description: 'Comprehensive reports with multiple sections', icon: '📄' },
          ].map((component) => (
            <div key={component.name} className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{component.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{component.name}</h3>
              <p className="text-gray-600">{component.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 rounded-2xl p-12 text-center">
        <h2 className="mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Experience the future of AI interaction. No coding required.
        </p>
        <a href="/superchat/expand" className="btn-primary text-lg px-8 py-3 inline-block">
          Start Chatting Now
        </a>
      </section>
    </div>
  )
}

export default LandingPage
