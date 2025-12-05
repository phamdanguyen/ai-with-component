# Phase 2 - Week 3: Prompt Engineering & Optimization

**Goal**: Optimize prompts for accuracy, reduce component generation failures, and implement A/B testing framework

---

## 📋 Overview

### Current State (After Week 1 SSE)
```
Streaming ✅ - Fast delivery
Accuracy ❌ - Component generation failures
Consistency ❌ - Variable response quality
Metrics ❌ - No performance tracking
```

### Target State (After Week 3)
```
Streaming ✅ - Fast delivery
Accuracy ✨ - 95%+ component generation success
Consistency ✨ - Reliable responses
Metrics ✨ - Full A/B test framework
```

---

## 🎯 Tasks & Subtasks

### Task 1: Analyze Current Failures & Bottlenecks
**Effort**: 3 story points | **Time**: 2-3 hours

**Goal**: Understand why component generation fails

**Current Code**:
- `packages/middleware/src/services/component-generation.service.ts`
- `packages/middleware/src/services/text-summary.service.ts`

**What to Do**:
1. Add error logging to component generation
2. Track failure rates by query type
3. Collect sample failures for analysis
4. Identify patterns in failures

**Implementation**:
```typescript
// Add to ComponentGenerationService
interface GenerationMetrics {
  queryType: string
  userMessage: string
  componentType: string
  success: boolean
  errorType?: string
  executionTime: number
  timestamp: number
}

// Log each attempt
async generateComponent(context: RequestContext): Promise<Component> {
  const startTime = Date.now()
  try {
    const result = await this.apiCall(context)
    this.metrics.log({
      ...context,
      success: true,
      executionTime: Date.now() - startTime
    })
    return result
  } catch (error) {
    this.metrics.log({
      ...context,
      success: false,
      errorType: error.message,
      executionTime: Date.now() - startTime
    })
    throw error
  }
}
```

**Files to Modify**:
- `packages/middleware/src/services/component-generation.service.ts` - Add metrics
- `packages/middleware/src/services/text-summary.service.ts` - Add error tracking
- `packages/middleware/src/types/core.types.ts` - Add GenerationMetrics interface

**Output**: Failure analysis report with categories and patterns

---

### Task 2: Optimize Text Summary Prompts
**Effort**: 4 story points | **Time**: 3-4 hours

**Goal**: Improve accuracy of text responses

**Current Issue**: Generic prompts leading to inconsistent quality

**System Prompts to Create**:
```typescript
// packages/middleware/src/prompts/text-generation.prompts.ts

export const TEXT_PROMPTS = {
  // Base system prompt
  base: `You are GenUI - an AI assistant that provides clear, concise explanations and generates interactive React components.

  Your responses should be:
  - Clear and concise (2-3 sentences maximum)
  - Action-oriented and practical
  - Free of unnecessary jargon
  - Focused on user value

  Format: Start with a brief explanation, then provide the component if relevant.`,

  // Query-specific prompts
  dataAnalysis: `Analyze the provided data and create a clear summary with key insights. Highlight the most important findings. Focus on actionable conclusions.`,

  codeExplanation: `Explain the code clearly and concisely. Break down the logic step by step. Highlight the key concepts and purpose.`,

  instructionalContent: `Provide step-by-step instructions that are easy to follow. Be specific about each step. Include relevant examples.`,

  dataVisualization: `Suggest the best visualization type for the data. Explain why it's appropriate. Include a brief interpretation of what the visualization reveals.`,

  // Few-shot examples
  examples: [
    {
      query: "Show me sales by region",
      expected: "A clear statement about what visualization to use, why, and what it shows"
    }
  ]
}
```

**Implementation Plan**:
1. Create prompt templates for different query types
2. Implement query classification (data, code, instruction, visualization, etc.)
3. Use appropriate prompt based on classification
4. Add system instructions for consistency
5. Test and refine based on results

**Files to Create/Modify**:
- `packages/middleware/src/prompts/text-generation.prompts.ts` (NEW)
- `packages/middleware/src/services/text-summary.service.ts` - Use new prompts
- `packages/middleware/src/services/query-classifier.service.ts` (NEW) - Classify queries

**Success Criteria**:
- Text responses are consistently clear
- Tone is uniform across responses
- No jargon unless explained
- Actionable for users

---

### Task 3: Optimize Component Generation Prompts
**Effort**: 5 story points | **Time**: 4-5 hours

**Goal**: Improve component generation success rate to 95%+

**Current Issues**:
- Invalid JSON responses
- Missing required fields
- Hallucinated component properties
- Inconsistent formatting

**System Prompts to Create**:
```typescript
// packages/middleware/src/prompts/component-generation.prompts.ts

export const COMPONENT_PROMPTS = {
  // Strict format requirements
  formatInstructions: `You MUST respond with ONLY valid JSON, no markdown, no explanations.

SCHEMA:
{
  "type": "chart" | "table" | "form" | "card" | "list" | "slide" | "report",
  "props": {
    "title": string,
    "data": array | object,
    "config": {
      // type-specific config
    }
  },
  "metadata": {
    "description": string,
    "generatedAt": ISO timestamp
  }
}`,

  // Component-specific prompts
  chart: `Generate a chart component.
  - Determine the best chart type based on data
  - Include proper labels and legend
  - Ensure data structure matches chart requirements
  - Add meaningful title and description`,

  table: `Generate a table component.
  - Include all data columns with clear headers
  - Format numbers appropriately (currency, decimals)
  - Add sorting/filtering capability description
  - Ensure consistent column widths`,

  form: `Generate a form component.
  - Include proper field labels and types
  - Add validation rules
  - Include helpful placeholders
  - Add submit button`,

  // Validation checklist
  validation: `BEFORE responding, verify:
  ✓ Response is valid JSON
  ✓ All required fields are present
  ✓ Data structure matches component type
  ✓ No placeholder values
  ✓ Proper data formatting`,

  // Error recovery
  recovery: `If the user query doesn't fit standard components:
  1. Suggest the most appropriate component type
  2. Explain why this type works best
  3. Provide reasonable defaults
  4. Ask clarifying questions if needed`
}
```

**Implementation Plan**:
1. Create comprehensive component generation prompts
2. Implement schema validation before API call
3. Add retries with refined prompts on failure
4. Implement fallback components
5. Add structured logging for each component type

**Files to Create/Modify**:
- `packages/middleware/src/prompts/component-generation.prompts.ts` (NEW)
- `packages/middleware/src/services/component-generation.service.ts` - Use new prompts
- `packages/middleware/src/services/schema-validator.service.ts` (NEW) - Validate responses
- `packages/middleware/src/types/component.types.ts` - Add component schemas

**Retry Logic**:
```typescript
async generateComponent(context): Promise<Component> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await this.callAPI(context, attempt)
      const validated = await this.validateSchema(response)
      return validated
    } catch (error) {
      if (attempt === 3) {
        return this.fallbackComponent(context)
      }
      // Refine prompt for next attempt
      context.prompt = this.refinePrompt(context.prompt, error)
    }
  }
}
```

**Success Criteria**:
- 95%+ first-time success rate
- Valid JSON responses 100%
- No missing required fields
- Proper data structure

---

### Task 4: Implement Query Classification
**Effort**: 3 story points | **Time**: 2-3 hours

**Goal**: Route queries to optimal prompts based on intent

**Classification Types**:
```typescript
type QueryType =
  | 'data-analysis'      // "Show sales by region"
  | 'code-explanation'   // "Explain this code"
  | 'instruction'        // "How to..."
  | 'visualization'      // "Create a chart"
  | 'question'          // "What is..."
  | 'chat'              // General conversation

interface ClassificationResult {
  type: QueryType
  confidence: number
  keywords: string[]
  suggestedComponent: string | null
}
```

**Implementation**:
```typescript
// packages/middleware/src/services/query-classifier.service.ts

export class QueryClassifierService {
  private classifier = await this.initializeClassifier()

  async classify(message: string): Promise<ClassificationResult> {
    // Fast heuristic check first
    const heuristicType = this.heuristicClassify(message)
    if (heuristicType.confidence > 0.8) {
      return heuristicType
    }

    // Use LLM for complex cases
    const llmResult = await this.llmClassify(message)
    return llmResult
  }

  private heuristicClassify(message: string): ClassificationResult {
    const patterns = {
      'data-analysis': /^(show|display|analyze|visualize|create).*(chart|graph|table|data|sales|revenue|metrics)/i,
      'code-explanation': /^(explain|show|how does).*(code|function|method|class)/i,
      'instruction': /^(how to|how do|steps to|teach|explain how)/i,
      'visualization': /^(create|generate|build).*(chart|graph|visualization|visual)/i
    }

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return {
          type: type as QueryType,
          confidence: 0.85,
          keywords: this.extractKeywords(message),
          suggestedComponent: this.suggestComponent(type)
        }
      }
    }

    return {
      type: 'chat',
      confidence: 0.5,
      keywords: [],
      suggestedComponent: null
    }
  }
}
```

**Files to Create**:
- `packages/middleware/src/services/query-classifier.service.ts` (NEW)
- `packages/middleware/src/types/classification.types.ts` (NEW)

**Usage in DualRequestHandler**:
```typescript
async handle(context: RequestContext): Promise<DualResponse> {
  // Classify query
  const classification = await this.classifier.classify(context.message)

  // Use classification-specific prompts
  const textPrompt = this.selectTextPrompt(classification.type)
  const componentPrompt = this.selectComponentPrompt(classification.type)

  // Generate with optimized prompts
  const [text, component] = await Promise.all([
    this.textService.generateSummary(context, textPrompt),
    this.componentService.generateComponent(context, componentPrompt)
  ])

  return { text, component }
}
```

---

### Task 5: Create A/B Testing Framework
**Effort**: 4 story points | **Time**: 3-4 hours

**Goal**: Track and compare prompt variations

**Metrics to Track**:
```typescript
interface PromptVariant {
  id: string
  name: string
  version: number
  type: 'text' | 'component'
  prompt: string
  createdAt: Date
  isActive: boolean
}

interface ABTestMetrics {
  variantId: string
  queryType: string
  success: boolean
  accuracy: number
  userSatisfaction?: number
  executionTime: number
  generatedAt: Date
}

interface ABTestResult {
  variantA: {
    id: string
    successRate: number
    avgAccuracy: number
    avgTime: number
    sampleSize: number
  }
  variantB: {
    id: string
    successRate: number
    avgAccuracy: number
    avgTime: number
    sampleSize: number
  }
  winner: 'A' | 'B' | 'tie'
  confidence: number
  statisticallySignificant: boolean
}
```

**Implementation**:
```typescript
// packages/middleware/src/services/ab-test.service.ts

export class ABTestService {
  async selectVariant(
    testId: string,
    userId: string
  ): Promise<PromptVariant> {
    const test = await this.getActiveTest(testId)

    // Deterministic assignment based on userId
    const hashValue = hash(userId)
    if (hashValue % 2 === 0) {
      return test.variantA
    } else {
      return test.variantB
    }
  }

  async recordResult(
    testId: string,
    variantId: string,
    metrics: ABTestMetrics
  ): Promise<void> {
    await this.storage.save({
      testId,
      variantId,
      ...metrics
    })
  }

  async getResults(testId: string): Promise<ABTestResult> {
    const results = await this.storage.query(testId)

    const groupedByVariant = groupBy(results, 'variantId')
    const variantA = this.calculateStats(groupedByVariant[testA_id])
    const variantB = this.calculateStats(groupedByVariant[testB_id])

    return {
      variantA,
      variantB,
      winner: this.determineWinner(variantA, variantB),
      confidence: this.calculateConfidence(variantA, variantB),
      statisticallySignificant: this.isSignificant(variantA, variantB)
    }
  }
}
```

**A/B Tests to Run**:
1. **Text Prompt Versions** (Week 3 Day 1-2)
   - Version A: Current prompts
   - Version B: New optimized prompts
   - Metric: User satisfaction, accuracy

2. **Component Generation** (Week 3 Day 3-4)
   - Version A: Current component prompts
   - Version B: New strict format prompts
   - Metric: Success rate, validation pass rate

3. **Temperature/Parameters** (Week 3 Day 5)
   - Version A: temperature=0.7
   - Version B: temperature=0.5
   - Metric: Consistency, accuracy

**Files to Create/Modify**:
- `packages/middleware/src/services/ab-test.service.ts` (NEW)
- `packages/middleware/src/services/metrics.service.ts` (NEW)
- `packages/middleware/src/types/ab-test.types.ts` (NEW)
- `packages/middleware/src/middleware/dual-request-handler.ts` - Add metrics recording

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('QueryClassifierService', () => {
  it('should classify data analysis queries', async () => {
    const result = await classifier.classify('Show sales by region')
    expect(result.type).toBe('data-analysis')
    expect(result.confidence).toBeGreaterThan(0.8)
  })

  it('should classify code explanation queries', async () => {
    const result = await classifier.classify('Explain this function')
    expect(result.type).toBe('code-explanation')
  })
})

describe('ComponentGenerationService with new prompts', () => {
  it('should generate valid JSON', async () => {
    const result = await service.generateComponent(context)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should include all required fields', async () => {
    const result = await service.generateComponent(context)
    expect(result.type).toBeDefined()
    expect(result.props).toBeDefined()
    expect(result.metadata).toBeDefined()
  })
})

describe('ABTestService', () => {
  it('should consistently assign same user to same variant', async () => {
    const variant1 = await abTest.selectVariant('test-1', 'user-123')
    const variant2 = await abTest.selectVariant('test-1', 'user-123')
    expect(variant1.id).toBe(variant2.id)
  })

  it('should record metrics correctly', async () => {
    await abTest.recordResult('test-1', 'variant-a', metrics)
    const results = await abTest.getResults('test-1')
    expect(results.variantA.sampleSize).toBeGreaterThan(0)
  })
})
```

### Integration Tests
```typescript
describe('End-to-end with optimized prompts', () => {
  it('should generate accurate text and valid component', async () => {
    const response = await handler.handle({
      message: 'Show me quarterly sales data',
      sessionId: 'test-session'
    })

    expect(response.text).toBeTruthy()
    expect(() => JSON.parse(response.component)).not.toThrow()
    expect(response.component.type).toBe('chart')
  })
})
```

---

## 📊 Success Criteria

✅ **Done** when:
1. ✅ Failure analysis complete with root causes identified
2. ✅ Text generation prompts optimized (clearer, more consistent)
3. ✅ Component generation success rate ≥ 95%
4. ✅ Query classification working (≥90% accuracy)
5. ✅ A/B testing framework implemented
6. ✅ First test running and producing results
7. ✅ All new tests passing
8. ✅ No breaking changes to existing endpoints

---

## 📈 Expected Improvements

**Before Week 3**:
- Text accuracy: ~70%
- Component generation success: ~80%
- Consistency: Variable
- Metrics: None

**After Week 3**:
- Text accuracy: ~95%
- Component generation success: ~95%
- Consistency: High
- Metrics: Full A/B testing capability
- Quality metrics tracked per query type

---

## 📝 Implementation Order

**Day 1** (2h)
- [ ] Analyze current failures and create report
- [ ] Add error logging to services
- [ ] Create GenerationMetrics interface

**Day 2** (3h)
- [ ] Create text generation prompts
- [ ] Implement query classifier service
- [ ] Test classifier accuracy

**Day 3** (3h)
- [ ] Create component generation prompts
- [ ] Implement schema validator
- [ ] Add retry logic

**Day 4** (2h)
- [ ] Create A/B test service
- [ ] Setup metrics tracking
- [ ] Run first A/B test

**Day 5** (2h)
- [ ] Integration testing
- [ ] Bug fixes and optimization
- [ ] Documentation and handoff

---

## 🚀 Next Steps (Week 4)

**UX Polish**:
- Add animations and transitions
- Loading skeletons for better perceived performance
- Error recovery UI improvements
- User feedback mechanisms for A/B tests
- Analytics dashboard for metrics

---

## 📋 Key Deliverables

1. **Failure Analysis Report** - Root causes and patterns
2. **Prompt Library** - Curated prompts for all query types
3. **Query Classifier** - Production-ready classification
4. **A/B Test Results** - First iteration of variant comparison
5. **Metrics Dashboard** - Success rates by component type
6. **Documentation** - Prompt engineering guidelines

---

## ⚠️ Potential Blockers

1. **LLM Limitations** - May need custom fine-tuning
2. **Response Time** - Validation might add latency
3. **Cost** - Additional API calls for validation
4. **Token Limits** - Longer prompts use more tokens

**Mitigations**:
- Cache validation schemas
- Use heuristic classification first
- Batch similar queries
- Optimize prompt length
