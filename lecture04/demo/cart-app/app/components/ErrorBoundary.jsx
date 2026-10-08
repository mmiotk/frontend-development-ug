'use client';

import { Component } from 'react';

// Error Boundaries must be class components in React 19.
// Catches rendering errors (and rejected promises read via use()) in the subtree.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called during render when a child throws.
  // Must be a pure function — returns the new state.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Called after render — for logging (side effects are OK here).
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <p>Wystąpił błąd: {this.state.error?.message}</p>;
    }
    return this.props.children;
  }
}
