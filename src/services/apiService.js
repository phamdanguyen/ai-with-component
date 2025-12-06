// API Service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/superchat/api'

class ApiService {
  async chatStream(message, sessionId) {
    const url = `${API_BASE_URL}/chat/stream`
    const params = new URLSearchParams({
      message,
      ...(sessionId && { session_id: sessionId }),
    })

    const eventSource = new EventSource(`${url}?${params}`)

    return new Promise((resolve, reject) => {
      const chunks = []

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          chunks.push(data)

          // Handle different message types
          if (data.type === 'component') {
            // Component data received
            console.log('Component received:', data)
          } else if (data.type === 'text') {
            // Text chunk received
            console.log('Text chunk:', data.content)
          } else if (data.type === 'done') {
            // Stream complete
            eventSource.close()
            resolve(chunks)
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        eventSource.close()
        reject(error)
      }
    })
  }

  async chat(message, sessionId) {
    const url = `${API_BASE_URL}/chat`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getHistory(sessionId) {
    const url = `${API_BASE_URL}/history`
    const params = new URLSearchParams({ session_id: sessionId })
    const response = await fetch(`${url}?${params}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async saveComponent(componentData) {
    const url = `${API_BASE_URL}/components/save`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(componentData),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getSavedComponents() {
    const url = `${API_BASE_URL}/components`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }
}

export default new ApiService()
