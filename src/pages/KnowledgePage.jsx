function KnowledgePage() {
  const articles = [
    {
      title: 'Getting Started with Super Chat',
      category: 'Basics',
      description: 'Learn the fundamentals of AI-powered UI generation and how to craft effective prompts.',
    },
    {
      title: 'Component Types and Use Cases',
      category: 'Components',
      description: 'Explore all 7 GenUI components: Tables, Charts, Cards, Lists, Forms, Slides, and Reports.',
    },
    {
      title: 'Advanced Prompting Techniques',
      category: 'Advanced',
      description: 'Master advanced techniques to get the exact UI components you need.',
    },
    {
      title: 'Integration Guide',
      category: 'Developer',
      description: 'Learn how to integrate Super Chat into your Odoo applications.',
    },
    {
      title: 'Best Practices',
      category: 'Tips',
      description: 'Discover best practices for effective AI interaction and UI generation.',
    },
    {
      title: 'API Reference',
      category: 'Developer',
      description: 'Complete API documentation for developers.',
    },
  ]

  const categories = ['All', 'Basics', 'Components', 'Advanced', 'Developer', 'Tips']

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-4">Knowledge Base</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about uniAI Super Chat. Guides, tutorials, and API documentation.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search articles..."
          className="input-field"
        />
      </div>

      {/* Categories */}
      <div className="flex justify-center space-x-4 flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-xs font-semibold text-primary-600 mb-2">
              {article.category}
            </div>
            <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
            <p className="text-gray-600 text-sm">{article.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a href="#" className="text-primary-600 text-sm font-medium hover:underline">
                Read article →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KnowledgePage
