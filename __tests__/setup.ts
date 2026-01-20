import '@testing-library/jest-dom'

declare global {
  namespace Vi {
    interface Matchers<R = any, T = any> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: any): R
      toHaveClass(...classNames: string[]): R
      toBeVisible(): R
    }
  }
}
