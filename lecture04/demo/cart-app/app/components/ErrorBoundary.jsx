'use client';

import { Component } from 'react';

// Error boundaries are still class components in React 19.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) return <p>Something went wrong: {this.state.error.message}</p>;
    return this.props.children;
  }
}
