import { Component } from 'react'

export class RuntimeBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return <p role="alert">Unable to load the application.</p>
    return this.props.children
  }
}
