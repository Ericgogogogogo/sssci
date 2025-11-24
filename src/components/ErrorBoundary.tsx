"use client"
import React from "react"

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary", error, errorInfo)
  }
  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }
  handleFeedback = () => {
    window.open("mailto:support@example.com?subject=反馈问题")
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-red-500/40 rounded">
          <div className="text-red-500 font-medium">发生错误</div>
          <div className="text-sm mt-2">{this.state.error?.message ?? "组件渲染失败"}</div>
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={this.handleRetry}>重试</button>
            <button className="px-3 py-1 rounded bg-gray-700 text-white" onClick={this.handleFeedback}>反馈问题</button>
          </div>
        </div>
      )
    }
    return this.props.children as any
  }
}