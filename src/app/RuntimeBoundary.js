import { Component, createElement } from 'react'

export class RuntimeBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return createElement('p', { role: 'alert' }, 'Unable to load the application.')
    return this.props.children
  }
}
