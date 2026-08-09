import { Component } from "react";

// Minimal error boundary. There is no hook equivalent — catching a render error
// still requires a class — so this stays a class component on purpose.
//
// Every lazy boundary in the app sits behind one of these. Without them a throw
// anywhere in a lazily-loaded chunk unmounts the whole React root, which turns a
// single broken feature into a blank page.
class ErrorBoundary extends Component {
 state = { failed: false };

 static getDerivedStateFromError() {
  return { failed: true };
 }

 componentDidCatch(error, info) {
  // Surfaced rather than swallowed: a silent fallback makes real breakage look
  // like an intentional design choice.
  console.error(`[${this.props.label ?? "ErrorBoundary"}]`, error, info?.componentStack);
  this.props.onError?.(error, info);
 }

 render() {
  if (this.state.failed) return this.props.fallback ?? null;
  return this.props.children;
 }
}

export default ErrorBoundary;
